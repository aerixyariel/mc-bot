const mineflayer = require('mineflayer')
const { mineflayer: mineflayerViewer } = require('prismarine-viewer')

const bot = mineflayer.createBot({
  host: 'samudra.aternos.me',
  port: '64210',
  username: 'Samudra',
  auth: 'offline',
  version: '1.20.2'
})

bot.once('spawn', () => {
  mineflayerViewer(bot, { port: 3007, firstPerson: false }) // port is the minecraft server port, if first person is false, you get a bird's-eye view
})

bot.on('chat', (username, msg) => {
  if (username === bot.username) return;
  bot.chat('pong')
})