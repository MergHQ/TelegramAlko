import * as Bacon from 'baconjs'
import { fromAction, sendAction } from '../actionDispatfcher'
import * as TelegramClient from 'node-telegram-bot-api'
import { searchProduct } from '../services/alkoProductService'
import searchResponseTemplate from '../templates/searchResponseTemplate'
import * as Sentry from '@sentry/node'

const parseArgs = (message: string) => {
  const splitted = message.split(' ')
  return splitted.length > 1 ? splitted.slice(1).join(' ') : 'Koskenkorva'
}

export function searchStore() {
  fromAction<TelegramClient.Message>('NEW_MESSAGE')
    .filter(e => e.text.startsWith('/etsi'))
    .debounce(500)
    .map(e => ({
      chatId: e.chat.id,
      data: parseArgs(e.text)}))
    .flatMapLatest(e =>
      Bacon.fromPromise(searchProducts(e.data)
        .then(data => ({ chatId: e.chatId, data }))))
    .flatMapError(error => {
      Sentry.captureException(error)
      return ''
    })
    .onValue(data => sendAction({id: 'SEND_MESSAGE', data}))
}

function searchProducts(searchTerm: string) {
  return searchProduct(searchTerm)
    .then(searchResponseTemplate)
}