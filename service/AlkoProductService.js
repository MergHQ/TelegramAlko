const cheerio = require('cheerio');
const needle = require('needle');
const bluebird = require('bluebird');

needle.get = bluebird.promisify(needle.get);
needle.post = bluebird.promisify(needle.post);

const SEARCH_URL = async searchTerm => {
  let result = await needle.post('https://www.alko.fi/INTERSHOP/web/WFS/Alko-OnlineShop-Site/fi_FI/-/EUR/ViewSuggestSearch-Suggest?SaytContext=Header&AjaxRequestMarker=true', `SearchTerm=${searchTerm}`);
  let $ = cheerio.load(result.body);
  if (!$('.search-tab-item').length) return '';
  let fc = $('.search-tab-item')[0].firstChild.data;
  let productCount = Number(fc.split('(')[1].split(')')[0].replace(' ', '')); // lol wtf is this
  return `https://www.alko.fi/tuotteet/tuotelistaus?SearchTerm=${searchTerm}&PageSize=12&PageNumber=${Math.floor(productCount / 12)}`;
}
const PRODUCT_URL = productId => `https://www.alko.fi/tuotteet/${productId}/`;

class AlkoProductService {

  async searchProduct(searchTerm) {
    let result = await needle.get(await SEARCH_URL(searchTerm));
    let body = cheerio.load(result.body);
    let products = body('.mini-product-wrap').toArray().map(productElem => {
      return this.parseElementData(productElem);
    });
    return products;
  }

  async getProductInformation(productId) {
    let result = await needle.get(PRODUCT_URL(productId));
    if (result.statusCode === 200) {
      let $ = cheerio.load(result.body);
      let name = $('.product-name')[0].children[0].data
      let price = $('.price-part')[0].parent.attribs.content;
      let factData = $('.fact-data');
      let alcohol = factData[0].children[0].data;
      let sugar = factData[1].children[0].data;
      let energy = factData[2].children[0].data;
      let pricePerLiter = factData[3].children[0].data;
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

  parseElementData(elem) {
    let data = elem.childNodes[1].firstChild.children[1];
    let id = data.attribs['data-alkoproduct'];
    let price = data.children[1].children[1].attribs.content
    let volume = data.children[3].firstChild.data;
    let name = data.children[6].children[1].children[3].children[1].firstChild.data
    return {
      id,
      name,
      volume,
      price
    };
  }

}

module.exports = AlkoProductService;