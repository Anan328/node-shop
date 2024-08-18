const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const mongoConnect = callback => {
  MongoClient.connect(
    'mongodb+srv://ananshah328:04password@clustershop.nyjycfj.mongodb.net/?retryWrites=true&w=majority&appName=ClusterShop'
  )
  //"mongodb+srv://anan:<password>@cluster0.mnxfnkh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    .then(client => {
      console.log('Connected!');
      callback(client);
    })
    .catch(err => {
      console.log(err);
    });
};

module.exports = mongoConnect;
