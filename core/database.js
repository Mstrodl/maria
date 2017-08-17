let Guild = require("./schemas/guild.js")
let User = require("./schemas/user.js")

async function guild(id) {
  return await buildShorthand({id: id}, Guild)
}

async function user(id) {
  return await buildShorthand({id: id}, User)
}


async function buildShorthand(query, construct) {
  let res = await construct.findOne(query)
  if(!res) {
    res = new construct(query)
    res.save()
  }
  return res
}

module.exports = {
  user,
  guild
}
