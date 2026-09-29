require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongodb = require('./db/connect');

const app = express();
const port = process.env.PORT || 3000;

// PT: Sem esta linha, req.body chega vazio no POST e no PUT.
// EN: Without this line, req.body arrives empty on POST and PUT.
app.use(express.json());
app.use(cors());

app.use('/', require('./routes'));

// PT: Nenhuma rota acima bateu -> a URL nao existe.
// EN: No route above matched -> the URL does not exist.
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// PT: Rede de seguranca para erros nao tratados.
// EN: Safety net for unhandled errors.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Unexpected server error.' });
});

// PT: Abre a porta PRIMEIRO. Licao do projeto anterior: se esperarmos o
//     banco para so entao escutar, o Render acha que o app nao subiu.
// EN: Open the port FIRST. Lesson from the previous project: waiting for
//     the database before listening makes Render think the app never started.
app.listen(port, () => {
  console.log(`Servidor escutando / Server listening on port ${port}`);
});

mongodb.initDb((err) => {
  if (err) {
    console.error('Falha ao conectar / Connection failed:', err.message);
    return;
  }
  console.log('Banco conectado / Database connected.');
});
