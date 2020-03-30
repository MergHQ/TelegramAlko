import axios from 'axios'

const alkoApi = axios.create({
  baseURL: `${process.env.ALKO_API_BASE_URL}/v1`,
  headers: {
    'x-api-key': process.env.ALKO_API_KEY,
    'Content-Type': 'application/json'
  }
})

const fixedSearchParams = {
  orderby: "name asc",
  top: 10
}

export interface SearchResult {
  id: string,
  name: string,
  volume: number,
  price: number
}

export interface Product {
  name: string,
  price: string,
  taste: string,
  energy: number,
  availavility: string
}

export const searchProduct = (searchTerm: string): Promise<SearchResult[]> =>
  alkoApi
    .post('/products/search', { ...fixedSearchParams, freeText: searchTerm })
    .then(({ data }) => data.value)
    .then(products =>
      products
        .map(({ id, name, volume, price }) => ({
          id,
          name,
          volume,
          price
        })
      ))

export const getProductInformation = (productId: string): Promise<Product> =>
  alkoApi
    .get(`/products/${productId}`)
    .then(({ data }) => data)
    .then(({ name, price, taste, energyPerDlKcal, webshopAvailability }) => ({
      name,
      price,
      taste,
      energy: energyPerDlKcal,
      availavility: webshopAvailability.status.en
    }))
