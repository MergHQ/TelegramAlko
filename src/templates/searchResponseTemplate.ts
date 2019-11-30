export default function(items: any[]) {
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
