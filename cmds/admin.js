let execFile = require("child_process").execFile

async function shutdown(ctx) {
  await ctx.send("dude rip")
  process.exit(0)
}

async function shell(ctx) {
  let kid = execFile("bash", ["-c", ctx.args.join(" ")], async function(err, stdout, stderr) {
    if(err) throw err
    await ctx.send(`\`${ctx.args.join(" ")}\`:
\`\`\`
${stdout}${stderr}
\`\`\``)
  })
}

async function update(ctx) {
  ctx.args = ["git", "pull"]
  await shell(ctx)
}

module.exports.commands = [
  {
    trigger: "shutdown",
    call: shutdown
  },
  {
    trigger: "shell",
    call: shell
  },
  {
    trigger: "update",
    call: update
  }
]
