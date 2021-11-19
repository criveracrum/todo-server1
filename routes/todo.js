var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const Todo = require('../models/Todo')

const privateKey = process.env.JWT_PRIVATE_KEY;

router.get('/', async function(req, res, next) {
    const todos = await Todo.find()
    return res.status(200).json({"todos": todos})
});

router.get('/:todoId', async function(req, res, next) {

    const todo = await Todo.findOne().where('_id').equals(req.params.todoId).exec()
    
    return res.status(200).json(todo)
});

router.use(function(req, res, next) {
        console.log(req.header("Authorization"))
        if (req.header("Authorization")) {
            try {
                req.payload = jwt.verify(req.header("Authorization"), privateKey, { algorithms: ['RS256'] })
                console.log(req.payload)
            } catch(error) {
                return res.status(401).json({"error": error.message});
            }
        } else {
            return res.status(401).json({"error": "Unauthorized"});
        }
        next()
    })



router.post('/', async function (req, res) {
    const todo = new Todo({
        "title": req.body.title,
        "description": req.body.description,
        "dateCreated": req.body.dateCreated,
        "complete": req.body.complete,
        "dateCompleted": req.body.dateCompleted,
        "creator": req.payload.id

        })
    
        await todo.save().then( savedTodo => {
            return res.status(201).json({
                "id": savedTodo._id,
                "title": savedTodo.title,
                "description": savedTodo.description,
                "dateCreated": savedTodo.dateCreated,
                "complete": savedTodo.complete,
                "dateCompleted": savedTodo.dateCompleted,
                "creator": savedTodo.creator

            })
        }).catch( error => {
            return res.status(500).json({"error": error.message})
        });
    })

router.delete('/:todoId', async function (req, res){
    
    const todo = await Todo.findByIdAndDelete(req.params.todoId).where('creator').equals(req.payload.id).exec()
    if (todo){
        return res.status(200).json(todo)
    } else {
        return res.status(401).json({"error": "Unauthorized"});
    }
})

router.patch('/:todoId', async function (req, res){
        const todo = await Todo.findOne().where('creator').equals(req.payload.id).exec()
        if (todo){await Todo.findByIdAndUpdate(req.params.todoId,
            {"complete" : req.body.complete,
            "dateCompleted": req.body.dateCompleted},
            {new: true}).then( updateTodo => {
                return res.status(201).json(updateTodo)
            }).catch( error => {
                return res.status(500).json({"error": error.message})
            });} else {
                return res.status(401).json({"error": "Unauthorized"});
            }

        
})

module.exports = router;