import * as Bacon from 'baconjs'
import { fromAction } from '../actionDispatcher'
import { SendMessageAction } from '../types'

export function sendMessageStore() {
  const sendMessageS = fromAction('SEND_MESSAGE')
  return Bacon.update<SendMessageAction>({type: 'message', chatId: '', data: ''},
    [sendMessageS, (iv, nv) => nv]
  )
}