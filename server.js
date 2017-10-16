const mongo = require('mongojs');
const db = mongo('urlsdb', ['urls_collection']);
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});
app.get('/new/:url', (req, res) => {
  let getNextSequenceValue = sequenceName => {
    const sequenceDocument = db.counters.findAndModify({
      query: {_id: sequenceName},
      update: {$inc: {sequence_value: 1}},
      new: true
    });
    return sequenceDocument.sequence_value;
  };
  let data = {};
  db.urls_collection.find((err, data) => {
    res.json(data);
  });
});

app.listen(3000);
