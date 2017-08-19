const MAX_MEME_NAME = 30

let Meme = require("../schemas/meme.js")
let snekfetch = require("snekfetch")

let RI_TABLE = {
  0: "zero",
  1: "one",
  2: "two",
  3: "three",
  4: "four",
  5: "five",
  6: "six",
  7: "seven",
  8: "eight",
  9: "nine",

  ".": "record_button",
  "!": "exclamation",
  "?": "question",
  "+": "heavy_plus_sign",
  "-": "heavy_minus_sign"
}

let alphabet = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]

for(let letter of alphabet) {
  RI_TABLE[letter] = `regional_indicator_${letter}`
}

async function add_meme(name, value, author_id, uses, nsfw) {
  meme = new Meme({
    name: name,
    value: value,
    uses: uses || 0,
    author_id: Number(author_id),
    nsfw: nsfw || false
  })
  
  meme.save()
}

async function get_meme(name) {
  return await Meme.findOne({name: name}) 
}

async function delete_meme(name) {
  let meme = await Meme.findOne({name: name})
  return await meme.remove()
}

async function update_meme(new_meme) {
  let updated = new Meme(new_meme)
  let old = await Meme.findOne({name: new_meme.name})
  await old.remove()
  await updated.save()
}

async function search_memes(name) {
  let list = await Meme.find({
    name: {
      $regex: new RegExp(name, "i") 
    }
  })

  return list.map(function(meme, i) {
    return `${i + 1}. ${meme.name}`
  })
}

let memeCommands = {
  add: addMemeCmd,
  get: getMemeCmd,
  rm: rmMemeCmd,
  rename: renameMemeCmd,
  owner: ownerMemeCmd,
  count: countMemeCmd,
  used: usedMemeCmd,
  top: topMemeCmd,
  see: seeMemeCmd,
  rand: randMemeCmd,
  search: searchMemeCmd
}

async function meme(ctx) {
  let subCommand = memeCommands[ctx.args.shift()]
  if(!subCommand) return await ctx.send("`m!help m`")
  await subCommand(ctx)
}

async function addMemeCmd(ctx) {
  let name = ctx.args.shift()
  let value = ctx.args.join(" ")

  if(name.length > MAX_MEME_NAME) return await ctx.send("2 long 5 me")
  if(!value) return await ctx.send("bad arg")


  let meme = await get_meme(name)
  if(meme) return await ctx.send("meme already exists")

  await add_meme(name, value, ctx.author.id, 0, ctx.channel.nsfw)
  await ctx.ok()
}

async function getMemeCmd(ctx) {
  let name = ctx.args.shift()
  let meme = await get_meme(name)
  if(!meme) {
    let probables = await search_memes(name)
    if(probables.length > 0) {
      await ctx.send(`Didn't you mean \`${probables.join(",")}\``)
      return
    }
    return await ctx.send("Meme not found.")
  }
  ++meme.uses
  meme.save()
  await ctx.send(meme.value)
}

async function rmMemeCmd(ctx) {
  let name = ctx.args.join(" ")
  let meme = await get_meme(name)
  if(!meme) {
    await ctx.send("Meme not found")
  }
  
  if(ctx.author.id != meme.author_id) {
    return await ctx.send("Unauthorized")
  }

  await delete_meme(name)
  await ctx.ok()
}

async function renameMemeCmd(ctx) {
  let name = ctx.args.shift()
  let new_name = ctx.args.shift()

  let meme = await get_meme(name)
  if(!meme) {
    return await ctx.send("Meme not found")
  }
  
  if(ctx.author.id != meme.author_id) {
    return await ctx.send("Unauthorized")
  }

  let new_name_meme = await get_meme(new_name)
  if(new_name_meme) {
    return await ctx.send("New name already used.")
  }
  
  delete_meme(meme.name)
  add_meme(new_name, meme.value, meme.author_id, meme.uses, meme.nsfw)
  await ctx.send(`Renamed ${meme.name} to ${new_name}`)
}

async function ownerMemeCmd(ctx) {
  let name = ctx.args.shift()

  let meme = await get_meme(name)
  if(!meme) {
    return await ctx.send("Meme not found")
  }

  await ctx.send(`\`${name}\` was made by ${ctx.bot.users.get(String(meme.author_id)).username}`)
}

async function topMemeCmd(ctx) {
  let memes = await Meme.find({})
  memes = memes.sort(function(meme1, meme2) {
    return meme2.uses - meme1.uses
  }).slice(0,14)

  await ctx.send(memes.map(function(meme, i) {
    return `[${i}] ${meme.name} used ${meme.uses} times`
  }))
}

async function countMemeCmd(ctx) {
  let memes = await Meme.find({})
  await ctx.send(`amount: ${memes.length}`)
}

async function usedMemeCmd(ctx) {
  let name = ctx.args.shift()

  let meme = await get_meme(name)
  if(!meme) {
    return await ctx.send("Meme not found")
  }

  await ctx.send(`\`${meme.name}\` => ${meme.uses} times`)
}

async function seeMemeCmd(ctx) {
  let owner = ctx.message.mentions.members.first()
  if(!owner) return ctx.send("bad arg")

  let memes = await Meme.find({author_id: owner.id})
  let memeList = memes.map(function(meme) {
    return meme.name
  }).join(", ")

  await ctx.send(`Showing ${memes.length}[${memes.length} in page],
Memes: ${memeList}`)
}

async function randMemeCmd(ctx) {
  let memes = await Meme.find({})
  
  let meme = memes[Math.floor(Math.random() * memes.length)]
  await ctx.send(`${meme.name}: ${meme.value}`)
}

async function searchMemeCmd(ctx) {
  let term = ctx.args.join(" ")
  if(term.length < 1) return await ctx.send("lul")

  let memes = await search_memes(term)
  if(memes.length < 1) return await ctx.send("No memes found")

  await ctx.send(memes.join(","), {code: true})
}

// TODO: Setup fullwidth
async function fullwidth(ctx) {
  await ctx.send("Not implemented")
}

async function ri(ctx) {
  let text = ctx.args.join(" ")
  if(!text) return await ctx.send("lul")
  let chars = text.split("").map(function(char) {
    let ri = RI_TABLE[char]
    if(!ri) return char
    return `:${ri}:`
  })
 
  if(chars.length == 1) await ctx.send(chars[0] + "\u200b")
  else await ctx.send(chars.join("\u200b"))
}

async function pupper(ctx) {
  await ctx.send("http://i.imgur.com/9Le8rW7.jpg :sob:")
}

async function br(ctx) {
  await ctx.send("br?")
}

async function urban(ctx) {
  // TODO: Add coins
  // await coins.pricing(ctx, config.prices.API)
  let query = ctx.args.join(" ")
  
  let res = await snekfetch.get(`https://api.urbandictionary.com/v0/define?term=${encodeURI(query)}`)
  if(!res.body.list) return await ctx.send("No results found")
  await ctx.send(`'${query}':
${res.body.list[0].definition}`, {code: true})
}

async function ejaculate(ctx) {
  await ctx.send("https://www.youtube.com/watch?v=S6UqgjaBt4w")
}

async function eightball(ctx) {
  let choices = [
     'Yes',
    'No',
    'Maybe',
    'Potentially',
    'Answer hazy',
    'Only in your dreams',
    'Ask later',
  ]
  let choice = choices[Math.floor(Math.random() * choices.length)]
  await ctx.send(`**${ctx.author.username}**, :8ball: said ${choice}.`)
}

module.exports.commands = [
  {
    trigger: "m",
    call: meme
  },
  {
    trigger: "ri",
    call: ri
  },
  {
    trigger: "pupper",
    call: pupper
  },
  {
    trigger: "8ball",
    call: eightball
  },
  {
    trigger: "urban",
    call: urban
  },
  {
    trigger: "ejaculate",
    call: ejaculate
  }
]
