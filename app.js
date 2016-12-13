'use strict';

const needle = require('needle');
const TelegramClient = require('node-telegram-bot-api');
const FS = require('fs');
const config = JSON.parse(FS.readFileSync('conf', 'utf8'));

var client = new TelegramClient(config.alkoBot, { polling: true });

client.onText(/\/jalluindeksi/, msg => {
  needle.get('http://droptable.tk:8080/products/000706', (err, res) => {
    client.sendMessage(msg.chat.id, 'Jallun hinta: ' + res.body.data.price + '€');
  });
});

client.onText(/\/price/, msg => {
  let arg = msg.text.split(' ')[1];
  if (arg) {
    needle.get('http://droptable.tk:8080/products', (err, res) => {
      let products = [];
      for (let i in res.body.data) {
        let o = res.body.data[i];
        try {
          if (o.name && o.name.toLowerCase().indexOf(arg.toLowerCase()) > -1) {
            products.push(o);
          }
        } catch (e) {
          console.log(e);
        }
      }

      let resStr = '';
      for (let o of products) {
        resStr += `${o.name.replace('*', '1t').replace('***', '3t')} | ${o.volume}l  | *${o.price}€*\n`;
      }

      client.sendMessage(msg.chat.id, resStr, { parse_mode: 'markdown' });
    });
  }
});

