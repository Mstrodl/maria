let cfg = require("../config.json")

async function ping(ctx) {
  let msg = await ctx.send("Pong!")
  msg.edit(`Pong! ${msg.createdTimestamp - ctx.message.createdTimestamp}ms`)
}

async function random(ctx) {
  let min = ctx.args.shift()
  if(!Number(min)) return await ctx.send("bad arg")
  let max = ctx.args.shift()
  if(!Number(max)) return await ctx.send("bad arg")

  if(Number(min) > Number(max)) {
    return await ctx.send("`min > max` u wot")
  }

  let rand = Math.floor(Math.random() * (max - min)) + Number(min)
  await ctx.send(`from ${min} to ${max} I go ${rand}`)
}

async function pick(ctx) {
  if(ctx.args.length < 1) {
    return await ctx.send("dude what")
  }

  await ctx.send(ctx.args[Math.floor(Math.random() * ctx.args.length)])
}

// TODO: Add version command
async function version(ctx) {
  await ctx.send("Not implemented")
}

let startTime = new Date().getTime()
async function uptime(ctx) {
  let diff = (new Date().getTime() - startTime) / 1000
  let time
  if(diff < 60) time = `${diff} seconds`
  else if(diff < 60 * 60) time = `${diff / 60} minutes`
  else if(diff < 60 * 60 * 60) time = `${diff / 60 / 60} hours`
  else time = `${diff / 60 / 60 / 24} days`
  ctx.send(`Up for ${time}`)
}

// TODO: Make stats work somehow
async function stats(ctx) {
  await ctx.send("Not implemented")
}

async function feedback(ctx) {
  let embed = {
    timestamp: new Date().getTime(),
    footer: "Feedback Report",
    author: {
      name: `${ctx.author.username}#${ctx.author.discriminator}`,
      icon: ctx.author.displayAvatar()
    },
    fields: [
      {
        title: "Feedback",
        value: ctx.args.join(" ")
      },
      {
        title: "Guild",
        value: `${ctx.guild.name} [${ctx.guild.id}]`
      },
      {
        title: "Channel",
        value: `${ctx.channel.name} [${ctx.channel.id}]`
      }
    ]
  }

  let feedbackChannel = msg.client.channels.get(cfg.feedbackChannel)
  if(!feedbackChannel) {
    await ctx.send("feedback channel not found we are fuckd")
    return
  }

  await feedbackChannel.send("", {
    embed: embed
  })
  await ctx.ok()
}

module.exports.commands = [
  {
    trigger: "ping",
    call: ping
  },
  {
    trigger: "random",
    call: random
  },
  {
    trigger: "pick",
    call: pick
  },
  {
    trigger: "version",
    call: version
  },
  {
    trigger: "uptime",
    call: uptime
  }
]
