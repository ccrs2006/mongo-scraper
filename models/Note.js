// require mongoose
const mongoose = require('mongoose');
// create a schema class
const Schema = mongoose.Schema;

// create the Note schema
const NoteSchema = new Schema({
  // Only a string
  title: {
    type:String
  },
  // Only a string
  body: {
    type:String
  }
});

// Remember, Mongoose will automatically save the ObjectIds of the notes.
// These ids are referred to in the Article model.

// create the Note model with the NoteSchema
const Note = mongoose.model('Note', NoteSchema);

// export the Note model
module.exports = Note;