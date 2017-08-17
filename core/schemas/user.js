let mongoose = require("mongoose")

module.exports = mongoose.model("user", {
  id: {
    type: Number,
    required: true
  }
})
