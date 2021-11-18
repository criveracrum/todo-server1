var express = require('express');
var router = express.Router();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const User = require('../models/User');

const saltRounds = 10;

const privateKey = `
-----BEGIN RSA PRIVATE KEY-----
MIICXgIBAAKBgQCCHv5sfIOEYf+4TNLfoUIre5GcpJGxb2t1c/TWOvFjE2x1VMwJ
bGzurdeeUss+PcItjuTNixOGNx7YO+HLZkLoW6WXlv9LWtHnbZvpzTZCTrfDxA4B
n/w3NEFp3tiu+CV8QRphvU1kYTbUo4+3Ko9eVNtt/BfLxsSpqQUaraunxQIDAQAB
AoGBAIBZnDNcusnpdLnRpawLP97uW5p8xm2UbxYDFD4BFDvbW/98bmrZNbZVajt0
haBWgOQ5cD3DcrXQRy+aGcZtj45ytqn2XgXpEiklq24cPflNB+1/BDxqylNT/CJf
wpi0vAKRqZRumF66mpeXy++3aaoLrIEcwyXRLU7HOCHf2wC9AkEA+1srhI5TXtCP
3TuN/vTksESYS4mJzKwi4sfbjEqq4ZyKwIsgHWhiJIVqxVl7OgSBgOkb/Fxcgu58
gn8rZyRw+wJBAISGbDnye3mPQkh6iylnheGTkrjv8nglB10TeKlE2fmhoR4cdfz4
JokN3XIWYZAj9TZ6teo4TUg8XNoEwJD4bj8CQQCcw+3OTJ3+ooE3b69N9hqzPPTn
F67T8gAIBLIPO3p8H5ACKkMrVDDxqiw/TWGne6vxZHHJ4SjpmCgbk4jUWUwFAkAk
UEk7n6wh5RV+ksWrNMjExRFBR86jCVJ5OKqph0pLUvS5MYdLKBw3FeuGJYfaXWAF
654JbiAPGStAOmkh0FE1AkEA8xkuzjVyHhsMG8kni0+h4iVyGc5GKZfvHQ23wzoN
I6lRcdmQQMSrPMfNne1bxtOSFdbZhNosi5uoHZcGKYeBWQ==
-----END RSA PRIVATE KEY-----
`

router.use(function(req, res, next) {
  bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(req.body.password, salt, function(err, hash) {
        req.hashedPassword = hash;
        next();
    });
  });
})

router.post('/login', async function(req, res, next) {
  if (req.body.username && req.body.password) {
    
    const user = await User.findOne().where('username').equals(req.body.username).exec()

    if (user) {
      return bcrypt.compare(req.body.password, user.password).then(result => {
        if (result === true) {
          const token = jwt.sign({ id: user._id }, privateKey, { algorithm: 'RS256' });
          return res.status(200).json({"access_token": token});
        } else {
          return res.status(401).json({"error": "Invalid credentials."})
        }
      }).catch(error => {
        return res.status(500).json({"error": error.message})
      });
    }

    return res.status(401).json({"error": "Invalid credentials."})

  } else {
    res.status(400).json({"error": "Username or Password Missing"})
  }
});

router.post('/register', async function(req, res, next) {
  if (req.body.username && req.body.password && req.body.passwordConfirmation) {
    if(req.body.password === req.body.passwordConfirmation) {
      const user = new User({
        "username": req.body.username,
        "password": req.hashedPassword
      })
          
      await user.save().then( savedUser => {
        console.log()
        return res.status(201).json({
          "id": savedUser._id,
          "username": savedUser.username
        })
      }).catch( error => {
        return res.status(500).json({"error": error.message})
      });
    }
    res.status(400).json({"error": "Passwords not matching"})
  } else {
    res.status(400).json({"error": "Username or Password Missing"})
  }
})

module.exports = router;
