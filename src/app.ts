require('dotenv').config()
import * as TelegramClient from 'node-telegram-bot-api'
import { sendAction } from './actionDispatfcher'
import { searchStore } from './stores/searchStore'
import { sendMessageStore } from './stores/sendMessage'
import * as Sentry from '@sentry/node'

Sentry.init({ dsn: process.env.SENTRY_DSN })

const client = new TelegramClient(process.env.ALKO_BOT_TOKEN, { polling: true });
client.on('message', msg => sendAction({ id: 'NEW_MESSAGE', data: msg }));

searchStore()
const sendMessageP = sendMessageStore()
sendMessageP.onValue(value => value.data.length > 0 && client.sendMessage(value.chatId, value.data, { parse_mode: "Markdown" }))
