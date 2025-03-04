'use strict';
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
require('dotenv').config();

module.exports = async function (app) {


  mongoose.connect(process.env.MONGO_URI);

  
  app.route('/api/stock-prices')
    .get(async function (req, res){
      const returnObject = {}
      let like = false;
      const stockObjects = []
      const likeList = []
      const stocks = typeof req.query.stock === 'string' ? [req.query.stock] : req.query.stock;
      if (req.query.like === 'true') {
        like = true;
      }
      for await (const stock of stocks) {
        const price = await fetchStockPrice(stock);
        let stockObject;
        let likeCount;
        if (price === undefined) {
          stockObject = { "error": "invalid symbol" }
        } else {
          stockObject = { "stock": stock.toUpperCase(), "price": price }
        }
        
        if (like) {
          const data = await addLike(stock, req.ip);
          likeCount = data.likes;
        } else {
          likeCount = await getLikeCount(stock)
        }
        likeList.push(likeCount);
        stockObjects.push(stockObject);
      }
      if (likeList.length > 1) {
        for (let i = 0; i < likeList.length; i++) {
          const j = i === 0 ? 1 : 0;
          stockObjects[i].rel_likes = likeList[i] - likeList[j];
        }
        returnObject.stockData = stockObjects;
      } else {
        stockObjects[0].likes = likeList[0];
        returnObject.stockData = stockObjects[0];
      }
      res.json(returnObject);
    });
    
};


const stockSchema = new mongoose.Schema({
  symbol: String,
  likes: {type: Number, default: 0},
  hashedIps: {type: [String], default: []}
})

const StockDB = mongoose.model('StockDB', stockSchema);

async function fetchStockPrice(stock) {
  const url = 'https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/'+ stock + '/quote'
  let response = await fetch(url);
  let data = await response.json();
  return data.latestPrice;
}

async function addLike(stock, ip) {
  const saltRounds = 10;
  let stockData = await StockDB.findOne({symbol: stock.toUpperCase()})
  if (stockData == null) {
    stockData = await addStock(stock);
  }
  
  const alreadyLiked = await checkIfAlradyLiked(stockData.hashedIps, ip);
  if (!alreadyLiked) {
    stockData.likes++;
    bcrypt.hash(ip, saltRounds, async function(err, hash) {
      stockData.hashedIps.push(hash);
      await stockData.save();
    })
  }
  return stockData;
}

async function checkIfAlradyLiked(hashedIps, ip) {
  for (let i = 0; i < hashedIps.length; i++) {
    const match = await bcrypt.compare(ip, hashedIps[i]);
    if (match) {
      return true;
    }
  }
  return false;
}

async function addStock(stock) {
  const newStock = new StockDB({symbol: stock.toUpperCase()})
  const savedStock = await newStock.save();
  return savedStock;
}

async function getLikeCount(stock) {
  let stockData = await StockDB.findOne({symbol: stock.toUpperCase()})
  if (stockData == null) {
    stockData = await addStock(stock);
  }
  return stockData.likes;
}
