import { SearchResult } from '../services/alkoProductService'

export default function(items: SearchResult[]) {
  return items
    .map(item =>
      item
        ? `***${item.name.replace(/\*/g, "⭐")}*** ${item.volume} ${
            item.price
          }€ | tuotteen tunnus: ${item.id}`
        : ''
    )
    .join('\n')
}
