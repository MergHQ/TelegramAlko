import * as cheerio from 'cheerio'
import axios from 'axios'


const SEARCH_URL = async searchTerm => {
  const result = await axios
    .post('https://www.alko.fi/INTERSHOP/web/WFS/Alko-OnlineShop-Site/fi_FI/-/EUR/ViewSuggestSearch-Suggest?SaytContext=Header&AjaxRequestMarker=true', `SearchTerm=${searchTerm}`)
    .then(({ data }) => data)
  const $ = cheerio.load(result);
  if (!$('.search-tab-item').length) return '';
  const fc = $('.search-tab-item')[0].firstChild.data;
  const productCount = Number(fc.split('(')[1].split(')')[0].replace(' ', '')); // lol wtf is this
  return `https://www.alko.fi/tuotteet/tuotelistaus?SearchTerm=${searchTerm}&PageSize=12&PageNumber=${Math.floor(productCount / 12)}`;
}
const PRODUCT_URL = productId => `https://www.alko.fi/tuotteet/${productId}/`;


export async function searchProduct(searchTerm) {
  const result = await axios
    .get(await SEARCH_URL(searchTerm))
    .then(({ data }) => data)
  const body = cheerio.load(result)
  const products = body('.product-data-container').toArray().map(productElem => {
    return parseElementData(productElem)
  });
  return products
}

export async function getProductInformation(productId) {
  const result = await axios
    .get(PRODUCT_URL(productId))
    .then(({ data }) => data)
    .catch(() => null)
  if (result) {
    const $ = cheerio.load(result);
    const name = $('.product-name')[0].children[0].data
    const price = $('.price-part')[0].parent.attribs.content;
    const factData = $('.fact-data');
    const alcohol = factData[0].children[0].data;
    const sugar = factData[1].children[0].data;
    const energy = factData[2].children[0].data;
    const pricePerLiter = factData[3].children[0].data;
    return {
      name,
      price,
      factData,
      alcohol,
      sugar,
      energy,
      pricePerLiter
    }
  }
}

function parseElementData(elem: CheerioElement) {
  const productData = JSON.parse(elem.attribs['data-product-data'])
  const price = elem.children.filter(e => e.type !== 'comment')[18].attribs['content']
  return {
    id: productData.id,
    name: productData.name,
    volume: productData.size,
    price
  }
}
