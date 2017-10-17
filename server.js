const mongo = require('mongojs');
const db = mongo('urlsdb', ['urls_collection']);
const express = require('express');
const app = express();
const serviceUrl = 'https://myshortapp.com/';

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/new', (req,res) => {
  res.end('err');;
});

app.get('/new/:protocol://*', (req, res) => {
  if ((req.params.protocol == 'http') || (req.params.protocol == 'https')){
    new Promise((resolve, reject) => {
      db.counters.findAndModify({
        query: {_id: 'url_id'},
        update: {$inc: {sequence_value: 1}},
        new: true
      }, (err, data) => {
        if (err) throw err;
        resolve(data.sequence_value.toString());
      });
    }).then((newId) => {
      newId = parseInt(newId);
      db.urls_collection.insert({
        _id: newId,
        original_url: req.params.protocol + '://' + req.params['0']
      });
      new Promise((resolve, reject) => {
        db.urls_collection.find({_id: newId}).toArray((err, data) => {
          resolve(data);
        });
      }).then(urlObj => {
        res.json(urlObj);
      }).catch(err => console.log(err));
    }).catch(e => {
      console.log(e);
    });
  } else {
    res.json({
      error: true
    });
  }
});
app.get('/new/*', (req,res) => {
  res.end('err');;
});
app.get('/:get_url_id', (req, res) => {
  if (Number(req.params.get_url_id)){
    new Promise((resolve, reject) => {
      db.urls_collection.find({_id: parseInt(req.params.get_url_id)})
        .toArray((err, data) => {
          if (err) throw err;
          if (data.length > 0) {
            resolve(data[0].original_url);
        } else {
          reject();
        }
      });
    }).then((data) => {
      res.redirect(data);
    }).catch(() => {
      res.json({
        error: 'This url does not exist'
      });
    });
} else {
  res.json({
    error: 'This url does not exist'
  });
}
});
app.listen(3000);
