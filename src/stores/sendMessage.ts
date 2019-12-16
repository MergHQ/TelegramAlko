import * as Bacon from 'baconjs'
import { fromAction } from '../actionDispatcher'
import { CommandResponse } from '../types'

export function sendMessageStore() {
  const sendMessageS = fromAction('SEND_MESSAGE')
  return Bacon.update<CommandResponse>({chatId: '', data: ''},
    [sendMessageS, (iv, nv) => nv]
  )
}