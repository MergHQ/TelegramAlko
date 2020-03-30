import * as Bacon from 'baconjs'
import { fromAction, sendAction } from '../actionDispatcher'
import * as TelegramClient from 'node-telegram-bot-api'
import { getProductInformation } from '../services/alkoProductService'
import productTemplate from '../templates/productInfoResponseTemplate'
import * as Sentry from '@sentry/node'

const parseArgs = (message: string) => {
  const splitted = message.split(' ')
  return splitted.length > 1 ? splitted.slice(1).join(' ') : ''
}

export function productInfoStore() {
  fromAction<TelegramClient.Message>('NEW_MESSAGE')
    .filter(e => e.text.startsWith('/tiedot'))
    .debounce(500)
    .map(e => ({
      chatId: e.chat.id,
      data: parseArgs(e.text)}))
    .flatMapLatest(e =>
      Bacon.fromPromise(productInfo(e.data)
        .then(data => ({ chatId: e.chatId, data }))))
    .flatMapError(error => {
      Sentry.captureException(error)
      return {
        data: ''
      }
    })
    .onValue(data => sendAction({id: 'SEND_MESSAGE', data}))
}

function productInfo(productId: string) {
  return getProductInformation(productId)
    .then(productTemplate)
}