const mongo = require('mongojs');
const db = mongo('urlsdb', ['urls_collection']);
const express = require('express');
const app = express();
const serviceUrl = 'https://myshortapp.com/';

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});
app.get('/new/:original_url', (req, res) => {
  let incrementNewUrl = collectionName => {
    return new Promise((resolve, reject) => {
      returnedId = db.counters.findAndModify({
        query: {_id: collectionName},
        update: {$inc: {sequence_value: 1}},
        new: true
      }, (err, data) => {
        if (err) throw err;
        resolve(data.sequence_value);
      });
    });
  };
  incrementNewUrl('url_id').then((newId) => {
    db.urls_collection.insert({
      _id: newId,
      original_url: req.params.original_url
    });
    new Promise((resolve, reject) => {
      db.urls_collection.find({_id: newId}).toArray((err, data) => {
        if (err) throw err;
        resolve(data[0]);
      });
    }).then((urlObj) => {
      res.json({
        original_url: urlObj.original_url,
        short_url: `${serviceUrl}${urlObj._id}`
      });
    });
  }).catch((err) => {
    console.log(err);
  });
});

app.listen(3000);
