const mongoose = require('mongoose');
const faker = require('faker');
const mongoUri = 'mongodb://localhost/kuyikMongo';
mongoose.Promise = global.Promise;

mongoose.connect(mongoUri, { useMongoClient: true });

var db = mongoose.connection;

db.on('error', function() {
  console.log('Mongo connection error:');
});

db.once('open', function() {
  console.log('Mongo connection successful');
});

const Post = mongoose.model('Post', { text: String });

module.exports.Post = Post;
