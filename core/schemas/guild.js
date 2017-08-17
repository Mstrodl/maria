let mongoose = require("mongoose")
let cfg = require("../../config.json")


module.exports = mongoose.model("guild", {
  id: {
    type: Number,
    required: true
  },
  prefix: {
    type: String,
    default: cfg.defaultPrefix
  }
})
