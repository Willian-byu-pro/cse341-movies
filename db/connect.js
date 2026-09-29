const { MongoClient } = require('mongodb');
require('dotenv').config();

// PT: Guarda o cliente do Mongo. Preenchido uma unica vez.
// EN: Holds the Mongo client. Filled only once.
let _client;

const initDb = (callback) => {
  if (_client) {
    return callback(null, _client);
  }

  // PT: Confere a variavel antes de entregar ao driver, para o erro
  //     ser legivel quando ela faltar.
  // EN: Check the variable before handing it to the driver, so the
  //     error is readable when it is missing.
  if (!process.env.MONGODB_URI) {
    return callback(new Error('MONGODB_URI nao esta definida / MONGODB_URI is not set.'));
  }

  MongoClient.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 })
    .then((client) => {
      _client = client;
      callback(null, _client);
    })
    .catch((err) => callback(err));
};

// PT: Devolve a conexao ja aberta. Usado pelos controllers.
// EN: Returns the already open connection. Used by the controllers.
const getDb = () => {
  if (!_client) {
    throw Error('Banco ainda nao conectado / Database not connected yet.');
  }
  return _client.db(process.env.MONGODB_DB);
};

module.exports = { initDb, getDb };

