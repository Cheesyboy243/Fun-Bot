const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, MessageManager, Embed, Collection } = require(`discord.js`);
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const path = require('path');
const { Events } = require('discord.js');
require('dotenv').config();
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences] });

const prefix = ";";

client.commands = new Collection();

//folder path
const functionsPath = path.join(__dirname, 'functions');
const commandsPath = path.join(__dirname, 'commands');
const eventPath = path.join(__dirname, 'events');

//file path
const functions = fs.readdirSync(functionsPath).filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync(eventPath).filter(file => file.endsWith('.js'));
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

(async () => {
  for (file of functions) {
    require(`./functions/${file}`)(client);
  }
  client.handleEvents(eventFiles, "./events");
})

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);

}


client.once('ready', () => {

  //you can set the words in the little brackets to what you like or just delete it all together
  client.user.setActivity(`SaintsRP`)

  const codes = {
    reset: '\x1b[0m',
    colors: {
        black: '\x1b[30m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m', 
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',
    },
    backgrounds: {
        black: '\x1b[40m',
        red: '\x1b[41m',
        green: '\x1b[42m',
        yellow: '\x1b[43m',
        blue: '\x1b[44m',
        magenta: '\x1b[45m',
        cyan: '\x1b[46m',
        white: '\x1b[47m',
    },
  };

  function buildColorConsole(fgColor = '', bgColor = '') {
    const logFunction = (text) => {
        const colorCode = `${fgColor}${bgColor}`;
        console.log(`${colorCode}%s${codes.reset}`, text);
    };
  
    const handler = {
        get(_, prop) {
            if (prop === 'reset') return buildColorConsole(fgColor, bgColor);
            if (prop === 'background') {
                return new Proxy({}, {
                    get(_, bgProp) {
                        const backgroundCode = codes.backgrounds[bgProp] || '';
                        return buildColorConsole(fgColor, backgroundCode);
                    }
                });
            }
            const colorCode = codes.colors[prop] || '';
            return buildColorConsole(colorCode, bgColor);
        },
        apply(_, thisArg, args) {
            logFunction(...args); 
        },
    };
    return new Proxy(logFunction, handler);
  }
 
  Object.keys(codes.colors).forEach((color) => {
    console[color] = buildColorConsole(codes.colors[color]);
  });
  
  console.red(`[${getTimestamp()}]: Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

client.on("messageCreate", (message) => {
  const messageSplit = message.content.slice(prefix.length).split(/ +/);
  const command = messageSplit.shift().toLowerCase();
  
   if (message.author.bot) return;
   if (!message.content.startsWith(prefix)) return;
  
   const messageArray = message.content.split(" ");
   const args = messageArray.slice(1);
   const cmd = messageArray[0];

  //membercount
  
  if (cmd === `${prefix}membercount`) {

  const m = message.guild.memberCount;
  const b = message.guild.members.cache.filter(member => member.user.bot).size;

  const memberEmbed = new EmbedBuilder()
  .setColor("Blurple")
  .setTitle("** Member Count**")
  .setDescription(`**Member Count:** ${m - b} \n\n**Bot Count:** ${b} \n\n**Total Members:** ${m}`)
  .setTimestamp()
   .setFooter({ text: `${message.author.tag}` });
  
    message.channel.send({ embeds: [memberEmbed] });
}

  //random number generator

  if (command === "random") {
  const randomEmbed = new EmbedBuilder()
  .setColor("Blurple")
  .setTitle("You rolled 🎲")
   .setDescription(Math.floor(Math.random() * args[0]).toString());
  
  if (args.length === 0) {
  return message.reply("Please enter a valid arguement");
   }
  if (args.length > 1) {
   return message.reply("Please enter one argument");
  }
  if (isNaN(args[0]) || !isFinite(args[0]))
  return message.reply("Please enter a valid number");
    
  message.reply({ embeds: [randomEmbed] });
  }
});

function getTimestamp() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

client.login(process.env.DISCORD_TOKEN);
