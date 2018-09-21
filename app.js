'use strict';

const needle = require('needle');
const TelegramClient = require('node-telegram-bot-api');
const FS = require('fs');
const config = require('./config.json');

const AlkoProductService = require('./service/AlkoProductService');

let alkoProductService = new AlkoProductService();

var client = new TelegramClient(config.alkoBot, { polling: true });

var jallustats = null;

function pollJallu() {
  needle.get(config.jalluinfoURL, (err, res) => {
    if (!err && res.body.message == 'Success')
      jallustats = res.body;
  });
}

pollJallu();
setInterval(pollJallu, 3600 * 1000);

client.onText(/\/jalluindeksi/, postJalluindeksi);
client.onText(/\/etsi/, findProducts);
client.onText(/\/hinta/, postPrice);

client.on('message', msg => {
  if (!msg.text) return;
  if (msg.text.toLowerCase() === 'nykyinen jalluindeksi?')
    postJalluindeksi(msg);
  else if (msg.text.toLowerCase().match(/mikä on tuotteen ([^\s]+) hinta\?/g))
    postPrice(msg);
  else if (msg.text.toLowerCase() === 'mikä on jallu?')
    postJalluinfo(msg);
  else if (msg.text.toLowerCase().includes('info'))
    postProductInformation(msg);
});

function findProducts(msg) {
  let splitMessage = msg.text.split(' ');
  let arg = splitMessage.length > 2 ? (() => { splitMessage.shift(); return splitMessage.join(' ')})() : msg.text.split(' ')[1];
  if (arg) {
    alkoProductService.searchProduct(arg).then(result => {
      let str = '';
      result.forEach(product => {
        if (product == null) return;
        str += `***${product.name.replace(/\*/g, '⭐')}*** ${product.volume} ${product.price}€ | tuotteen tunnus: ${product.id}\n`;
      });
      client.sendMessage(msg.chat.id, str, {
        parse_mode: 'markdown'
      });
    }).catch(e => console.error(e))
  }
}

function postJalluinfo(msg) {
  if (!jallustats) return;
  let str = '';
  str += `***Current price:*** ${jallustats.data.price} €\n`;
  str += `***Alcohol precentage:*** ${jallustats.data.alcohol}\n`;
  str += `***Sugar:*** ${jallustats.data.sugar}\n`;
  str += `***Energy:*** ${jallustats.data.energy}`;
  client.sendMessage(msg.chat.id, str, { parse_mode: 'markdown' });
}

function postProductInformation(msg) {
  let product = msg.text.substr(0, msg.text.toLowerCase().indexOf('info') + 1);
  if (product === 'jallu') {
    postJalluinfo();
    return;
  }
  needle.get('http://droptable.tk:8080/products', (err, res) => {
    for (let i in res.body.data) {
      let o = res.body.data[i];
      try {
        if (o.name && o.name.toLowerCase().indexOf(product.toLowerCase()) > -1) {
          let str = '';
          str += `***Current price:*** ${o.price} €\n`;
          str += `***Producer:*** ${o.producer} €\n`
          str += `***Volume:*** ${o.volume}`;
          client.sendMessage(msg.chat.id, str, { parse_mode: 'markdown' });
        }
      } catch (e) {
        console.log(e);
      }
    }
  });
}

function postJalluindeksi(msg) {
  if (jallustats)
    client.sendMessage(msg.chat.id, 'Jallun hinta: ' + jallustats.data.price + '€');
}

function postPrice(msg) {
  let arg = msg.text.split(' ').length > 2 ? msg.text.split(' ')[3] : msg.text.split(' ')[1];
  if (arg) {
    alkoProductService.getProductInformation(arg).then(product => {
      if (!product) return;
    let str = `***${product.name.replace(/\*/g, '⭐')}***\n`;
      str += `***Current price:*** ${product.price} €\n`;
      str += `***Alcohol precentage:*** ${product.alcohol}\n`;
      str += `***Sugar:*** ${product.sugar}\n`;
      str += `***Energy:*** ${product.energy}`;
      client.sendMessage(msg.chat.id, str, { parse_mode: 'markdown' });
    });
  }
}
