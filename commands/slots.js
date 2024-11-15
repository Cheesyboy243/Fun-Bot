const { SlashCommandBuilder } = require('discord.js');
const { Slots } = require('discord-gamecord');

module.exports = {
    data: new SlashCommandBuilder()
    .setName(`slots`)
    .setDescription(`Play some slots`),
    async execute (interaction) {

      const Game = new Slots({
        message: interaction,
        isSlashGame: true,
        embed: {
          title: 'Slot Machine',
          color: '#5865F2'
        },
        slots: ['🍆', '🍊', '🍋', '🍌']
      });
      
      Game.startGame();
      Game.on('gameOver', result => {
         return;
      });
    

}}
