let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let memeSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  uses: {
    type: Number,
    required: true,
    default: 0
  },
  author_id: {
    type: mongoose.Schema.Types.Long
  },
  nsfw: {
    type: Boolean,
    default: false
  }
})

let Meme = mongoose.model("memes", memeSchema)
module.exports = Meme
