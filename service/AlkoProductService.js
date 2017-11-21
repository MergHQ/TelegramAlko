const cheerio = require('cheerio');
const needle = require('needle');
const bluebird = require('bluebird');

needle.get = bluebird.promisify(needle.get);
needle.post = bluebird.promisify(needle.post);

const SEARCH_URL = 'https://www.alko.fi/INTERSHOP/web/WFS/Alko-OnlineShop-Site/fi_FI/-/EUR/ViewSuggestSearch-Suggest?OnlyProductSearch=true&SaytContext=SERP&AjaxRequestMarker=true';
const PRODUCT_URL = productId => `https://www.alko.fi/tuotteet/${productId}/`;

class AlkoProductService {

  async searchProduct(searchTerm) {
    let result = await needle.post(SEARCH_URL, 'SearchTerm=' + searchTerm);
    let body = cheerio.load(result.body);
    let products = body('.search-tab-item').toArray().map(productElem => {
      let productElemAttribs = productElem.attribs.href.split('/');
      if (productElemAttribs.length < 5)
        return;
      else
        return {name: productElem.firstChild.data, id: productElem.attribs.href.split('/')[4]}
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

}

module.exports = AlkoProductService;