let config = require("../config.json")
let {guild, user} = require("./database")
let fs = require("fs-extra")
let path = require("path")
let logger = require("./logger")

async function init(bot) {
  await loadModules(bot)
  bot.on("message", messageHandler)
}

let modules = []

async function loadModules(bot) {
  let mods = await fs.readdir(path.join(__dirname, "..", "cmds"))
  if(!mods) throw new Error("No modules to load!")
  modules = mods.map(function(mod) {
    return require(path.join(__dirname, "..", "cmds", mod))
  })

  mods.forEach(function(mod) {
    if(!mod.hooks) return
    mod.hooks.forEach(function(hook) {
      switch(hook.trigger) {
        case "load": {
          hook.call(bot)
          break
        }
        default: {
          bot.on(hook.trigger, hook.call)
        }
      }
    })
  })
}

async function messageHandler(msg) {
  if(msg.author.id == msg.client.user.id) return // Save ourselves from useless extra requests

  let guildDB = null
  if(msg.guild) guildDB = await guild(msg.guild.id)
  let userDB = await user(msg.author.id)

  let prefix = guildDB.prefix || config.defaultPrefix || "m!"

  let ctx = {
    message: msg,
    send: (content, options) => msg.channel.send(content, options),
    userDB: userDB,
    guildDB: guildDB,
    args: msg.content.split(" ").slice(1),
    ok: () => msg.react("\uD83D\uDC4C"),
    guild: msg.guild,
    channel: msg.channel,
    author: msg.author,
    member: msg.member,
    me: msg.guild ? msg.guild.me : msg.client.user,
    getMessage: msg.channel.getMessage,
    pins: msg.channel.pins,
    prefix: prefix
  }

  if(!msg.content.startsWith(prefix)) return // No command matched since not right prefix

  for(let mod of modules) {
    for(let cmd of mod.commands) {
      let matched = msg.content.split(" ")[0].toLowerCase() == prefix + cmd.trigger
      if(!matched) {
        console.log("Not right cmd")
        continue
      }
      logger.log(`Matched command ${cmd.trigger}`)
      try {
        await cmd.call(ctx)
      } catch(e) {
        msg.channel.send("An unknown error occurred!")
        logger.log(e)
      }
      break
    }
  }
}

module.exports = {
  init
}
