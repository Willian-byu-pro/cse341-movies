const { ObjectId } = require('mongodb');
const { getDb } = require('../db/connect');

const COLLECTION = 'genres';
const REQUIRED_FIELDS = ['name', 'description', 'popularity', 'active'];

const TEXT_FIELDS = ['name', 'description'];

// PT: Monta o filme so com os 8 campos. Campos extras enviados pelo
//     cliente sao descartados aqui e nunca chegam ao banco.
// EN: Builds the movie with the 8 fields only. Extra fields sent by the
//     client are dropped here and never reach the database.
const buildGenre = (body) => ({
  name: body.name,
  description: body.description,
  popularity: body.popularity,
  active: body.active
});

// =====================================================================
// PT: VALIDACAO - devolve uma LISTA de erros. Lista vazia = tudo certo.
//     Devolver todos os erros de uma vez e melhor que parar no primeiro:
//     o cliente conserta tudo numa tentativa so.
// EN: VALIDATION - returns a LIST of errors. Empty list = all good.
//     Returning every error at once beats stopping at the first one:
//     the client fixes everything in a single attempt.
// =====================================================================
const validateGenre = (body) => {
  const errors = [];

  // --- Nivel 1: o campo veio? / Level 1: is the field present? ---
  REQUIRED_FIELDS.forEach((field) => {
    const value = body[field];
    if (value === undefined || value === null || String(value).trim() === '') {
      errors.push(field + ' is required.');
    }
  });

  // PT: Se algo faltou, nao adianta checar o tipo de um campo inexistente.
  // EN: If something is missing, checking the type of a missing field is pointless.
  if (errors.length > 0) return errors;

  // --- Nivel 2: o tipo esta certo? / Level 2: is the type right? ---
  TEXT_FIELDS.forEach((field) => {
    if (typeof body[field] !== 'string') {
      errors.push(field + ' must be a text value.');
    }
  });

  // --- Nivel 3: o valor faz sentido? / Level 3: does the value make sense? ---
  // PT: O else if garante que so comparamos a faixa depois de saber que e numero.
  // EN: The else if makes sure we only compare the range once we know it is a number.
  if (typeof body.popularity !== 'number') {
    errors.push('popularity must be a number.');
  } else if (body.popularity < 1 || body.popularity > 10) {
    errors.push('popularity must be between 1 and 10.');
  }

  // PT: So true e false sem aspas sao 'boolean'; "true" com aspas e 'string'.
  // EN: Only true and false without quotes are 'boolean'; "true" in quotes is a 'string'.
  if (typeof body.active !== 'boolean') {
    errors.push('active must be true or false.');
  }


  return errors;
};

  

// PT: Todas as rotas com :id repetem esta checagem. Melhor uma funcao.
// EN: Every route with :id repeats this check. A function is better.
const invalidId = (id) => !ObjectId.isValid(id);

// =====================================================================
// GET /genres
// =====================================================================
const getAll = async (req, res) => {
  try {
    const genres = await getDb().collection(COLLECTION).find().toArray();
    res.status(200).json(genres);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =====================================================================
// GET /genres/:id
// =====================================================================
const getSingle = async (req, res) => {
  try {
    if (invalidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid genre id.' });
    }

    const genre = await getDb()
      .collection(COLLECTION)
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!genre) {
      return res.status(404).json({ message: 'Genre not found.' });
    }

    res.status(200).json(genre);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =====================================================================
// POST /genres  -> PT: cria e devolve o id / EN: creates and returns the id
// =====================================================================
const createGenre = async (req, res) => {
  try {
    const errors = validateGenre(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed.', errors: errors });
    }

    const response = await getDb().collection(COLLECTION).insertOne(buildGenre(req.body));
    if (!response.acknowledged) {
      return res.status(500).json({ message: 'Error while creating the genre.' });
    }

    // PT: 201 = "Created". O id gerado volta no corpo.
    // EN: 201 = "Created". The generated id comes back in the body.
    res.status(201).json({ id: response.insertedId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =====================================================================
// PUT /genres/:id  -> PT: substitui o filme / EN: replaces the movie
// =====================================================================
const updateGenre = async (req, res) => {
  try {
    if (invalidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid genre id.' });
    }

    const errors = validateGenre(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed.', errors: errors });
    }

    // PT: PUT substitui o documento inteiro -> replaceOne, nao updateOne.
    //     O _id nao muda: serve apenas para localizar o documento.
    // EN: PUT replaces the whole document -> replaceOne, not updateOne.
    //     The _id never changes: it only locates the document.
    const response = await getDb()
      .collection(COLLECTION)
      .replaceOne({ _id: new ObjectId(req.params.id) }, buildGenre(req.body));

    if (response.matchedCount === 0) {
      return res.status(404).json({ message: 'Genre not found.' });
    }

    // PT: 204 = "No Content": deu certo, nada a devolver.
    // EN: 204 = "No Content": it worked, nothing to return.
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =====================================================================
// DELETE /genres/:id
// =====================================================================
const deleteGenre = async (req, res) => {
  try {
    if (invalidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid genre id.' });
    }

    const response = await getDb()
      .collection(COLLECTION)
      .deleteOne({ _id: new ObjectId(req.params.id) });

    if (response.deletedCount === 0) {
      return res.status(404).json({ message: 'Genre not found.' });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = { getAll, getSingle, createGenre, updateGenre, deleteGenre };