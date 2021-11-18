const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TodoSchema = new Schema(
  {
    title: {type: String, required: true},
    description: {type: String, required: true,},
    dateCreated: {type: String, required: true,},
    complete: {type: Boolean, required: true,},
    dateCompleted: {type: String, required: false,},
    creator: {type: Schema.Types.ObjectId, ref: 'User'}
  }
);

//Export model
module.exports = mongoose.model('Todo', TodoSchema);

