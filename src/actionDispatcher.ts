import * as Bacon from 'baconjs'

type Action<T> = {
  id: string
  data: T
}

export const bus = new Bacon.Bus<Action<any>>()

export const sendAction = <T>(action: Action<T>) => {
  bus.push(action)
}

export const fromAction = <T>(id: string): Bacon.EventStream<T> => bus
  .filter(e => e.id === id)
  .map(e => e.data as T)