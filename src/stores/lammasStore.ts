import { fromAction, sendAction } from '../actionDispatcher'

export const lammasStore = () => {
  fromAction('LAMMAS')
    .map(stickerId => ({
      chatId: process.env.RC_CHAT_ID,
      stickerId
    }))
    .onValue(data => sendAction({id: 'SEND_MESSAGE', data: {
      type: 'sticker',
      ...data
    }}))
}
