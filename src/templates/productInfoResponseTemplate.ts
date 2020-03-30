import { Product } from '../services/alkoProductService'

const format = ({ name, price, taste, energy, availavility }: Product) => `
  ***Name***: ${name.replace(/\*/g, "⭐")}
  ***Price***: ${price}€
  ***Taste***: ${taste}
  ***Energy***: ${energy}kcal
  ***Availability***: ${availavility}
`

export default format
