require("mongoose-long")(require("mongoose"));
let Discord = require("discord.js")
let bot = new Discord.Client()
let config = require("./config.json")
let logger = require("./core/logger")
let commandHandler = require("./core/command")
let mongoose = require("mongoose")

mongoose.connect(config.mongo)

bot.login(config.token).then(function() {
  logger.log("Ready!")
}).catch(function() {
  logger.error("Error logging in")
  throw new Error("Couldn't login to Discord")
})

commandHandler.init(bot)
