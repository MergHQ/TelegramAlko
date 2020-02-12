
export interface CommandResponse {
  type: 'message',
  chatId: string
  data: string
}

export type SendStickerAction = {
  type: 'sticker',
  chatId: string,
  stickerId: string
}

export type SendMessageAction = CommandResponse | SendStickerAction