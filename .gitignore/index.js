const botconfig = require("./botconfig.json");
const Discord = require("discord.js");
const fs = require("fs");
const exp = require('./exp.json');
const bot = new Discord.Client({disableEveryone: true});
bot.commands = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {

  if(err) console.log(err);
  let jsfile = files.filter(f => f.split(".").pop() === "js")
  if(jsfile.length <= 0){
    console.log("Impossible de trouver des commandes.");
    return;
  }

  jsfile.forEach((f, i) =>{
    let props = require(`./commands/${f}`);
    console.log(`${f} Chargée!`);
    bot.commands.set(props.help.name, props);
  });
});

bot.on("ready", async () => {
  console.log(`${bot.user.username} est en ligne sur ${bot.guilds.size} serveurs!`);
  bot.user.setActivity("!help | Flamo", {type: "WATCHING"});

});

bot.on("message", async message => {
  if(message.author.bot) return;
  if(message.channel.type === "dm") return;

  let prefixes = JSON.parse(fs.readFileSync("./prefixes.json", "utf8"));

  // SYSTEME DE LEVEL

  let addExp = Math.floor(Math.random() * 5) + 1;

  if (!exp[message.author.id]){
    exp[message.author.id] ={
      exp : 0,
      niveau: 1
    }
  }
  let currentExp = exp[message.author.id].exp;
  let currentNiv = exp[message.author.id].niveau;
  let nextLevel = currentNiv * 15;
  exp[message.author.id].exp = currentExp + addExp;

  if (nextLevel <= currentExp){
    exp[message.author.id].niveau += 1;
    message.channel
      .send(`Bravo, tu es passé niveau ${currentNiv +1}, c'est génial !`)
  }

  fs.writeFile('./exp.json', JSON.stringify(exp), err => {
    if (err) console.log(err);
  })


  //variable

  if (!prefixes[message.guild.id]){
      prefixes[message.guild.id] ={
          prefixes: botconfig.prefix
      }
  }

  let prefix = prefixes[message.guild.id].prefixes;

  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);
  let commandfile = bot.commands.get(cmd.slice(prefix.length));
  if(commandfile) commandfile.run(bot,message,args);

});

bot.login("NTk2MDg0OTI1ODAzOTIxNDIw.XR8g8w.BmmIB-79Wd7BM2rv1pNlOiCq6PM");
