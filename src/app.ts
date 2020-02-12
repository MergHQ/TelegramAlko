require('dotenv').config()
import * as TelegramClient from 'node-telegram-bot-api'
import { sendAction } from './actionDispatcher'
import { searchStore } from './stores/searchStore'
import { sendMessageStore } from './stores/sendMessage'
import * as Sentry from '@sentry/node'
import * as cron from 'node-cron'
import { lammasStore } from './stores/lammasStore'

Sentry.init({ dsn: process.env.SENTRY_DSN })

const client = new TelegramClient(process.env.ALKO_BOT_TOKEN, { polling: true })
client.on('message', msg => {
  sendAction({ id: 'NEW_MESSAGE', data: msg })
})

const cronOpts: cron.ScheduleOptions = {
  timezone: 'Europe/Helsinki'
}

cron.schedule('0 59 7 * * 0-5', () => {
  sendAction({
    id: 'LAMMAS',
    data: 'CAACAgQAAxkBAAIGMF5EEcFzmcpMqlw9NFwukXs39mQIAAInAAMYy4EM-VhnriMw-PAYBA'
  })
}, cronOpts)

cron.schedule('0 0 16 * * 0-5', () => {
  sendAction({
    id: 'LAMMAS',
    data: 'CAACAgQAAxkBAAIGLF5EDZRFpvVV7T_4fahn5iGGIqW4AAIfAAMYy4EMTMSJRD8jYKMYBA'
  })
}, cronOpts)

searchStore()
lammasStore()
const sendMessageP = sendMessageStore()
sendMessageP
  .onValue(value => {
    switch(value.type) {
      case 'message':
        value.data.length > 0 && client.sendMessage(value.chatId, value.data, { parse_mode: "Markdown" })
        break;
      case 'sticker':
        value.stickerId.length > 0 && client.sendSticker(value.chatId, value.stickerId)
    }
  })
