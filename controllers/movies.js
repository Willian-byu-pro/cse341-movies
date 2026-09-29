const { ObjectId } = require('mongodb');
const { getDb } = require('../db/connect');

const COLLECTION = 'movies';

const REQUIRED_FIELDS = [
  'title', 'director', 'year', 'genre', 'duration', 'rating', 'language', 'synopsis'
];
const TEXT_FIELDS = ['title', 'director', 'genre', 'language', 'synopsis'];

// PT: Monta o filme so com os 8 campos. Campos extras enviados pelo
//     cliente sao descartados aqui e nunca chegam ao banco.
// EN: Builds the movie with the 8 fields only. Extra fields sent by the
//     client are dropped here and never reach the database.
const buildMovie = (body) => ({
  title: body.title,
  director: body.director,
  year: body.year,
  genre: body.genre,
  duration: body.duration,
  rating: body.rating,
  language: body.language,
  synopsis: body.synopsis
});

// =====================================================================
// PT: VALIDACAO - devolve uma LISTA de erros. Lista vazia = tudo certo.
//     Devolver todos os erros de uma vez e melhor que parar no primeiro:
//     o cliente conserta tudo numa tentativa so.
// EN: VALIDATION - returns a LIST of errors. Empty list = all good.
//     Returning every error at once beats stopping at the first one:
//     the client fixes everything in a single attempt.
// =====================================================================
const validateMovie = (body) => {
  const errors = [];
  const currentYear = new Date().getFullYear();

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

  // PT: 1888 e o ano do filme mais antigo que sobreviveu ate hoje.
  // EN: 1888 is the year of the oldest surviving film.
  if (typeof body.year !== 'number' || !Number.isInteger(body.year)) {
    errors.push('year must be an integer number.');
  } else if (body.year < 1888 || body.year > currentYear + 5) {
    errors.push('year must be between 1888 and ' + (currentYear + 5) + '.');
  }

  if (typeof body.duration !== 'number' || body.duration <= 0) {
    errors.push('duration must be a number greater than 0.');
  }

  if (typeof body.rating !== 'number' || body.rating < 0 || body.rating > 10) {
    errors.push('rating must be a number between 0 and 10.');
  }

  return errors;
};

// PT: Todas as rotas com :id repetem esta checagem. Melhor uma funcao.
// EN: Every route with :id repeats this check. A function is better.
const invalidId = (id) => !ObjectId.isValid(id);

// =====================================================================
// GET /movies
// =====================================================================
const getAll = async (req, res) => {
  try {
    const movies = await getDb().collection(COLLECTION).find().toArray();
    res.status(200).json(movies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =====================================================================
// GET /movies/:id
// =====================================================================
const getSingle = async (req, res) => {
  try {
    if (invalidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid movie id.' });
    }

    const movie = await getDb()
      .collection(COLLECTION)
      .findOne({ _id: new ObjectId(req.params.id) });

    if (!movie) {
      return res.status(404).json({ message: 'Movie not found.' });
    }

    res.status(200).json(movie);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =====================================================================
// POST /movies  -> PT: cria e devolve o id / EN: creates and returns the id
// =====================================================================
const createMovie = async (req, res) => {
  try {
    const errors = validateMovie(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed.', errors: errors });
    }

    const response = await getDb().collection(COLLECTION).insertOne(buildMovie(req.body));
    if (!response.acknowledged) {
      return res.status(500).json({ message: 'Error while creating the movie.' });
    }

    // PT: 201 = "Created". O id gerado volta no corpo.
    // EN: 201 = "Created". The generated id comes back in the body.
    res.status(201).json({ id: response.insertedId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =====================================================================
// PUT /movies/:id  -> PT: substitui o filme / EN: replaces the movie
// =====================================================================
const updateMovie = async (req, res) => {
  try {
    if (invalidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid movie id.' });
    }

    const errors = validateMovie(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Validation failed.', errors: errors });
    }

    // PT: PUT substitui o documento inteiro -> replaceOne, nao updateOne.
    //     O _id nao muda: serve apenas para localizar o documento.
    // EN: PUT replaces the whole document -> replaceOne, not updateOne.
    //     The _id never changes: it only locates the document.
    const response = await getDb()
      .collection(COLLECTION)
      .replaceOne({ _id: new ObjectId(req.params.id) }, buildMovie(req.body));

    if (response.matchedCount === 0) {
      return res.status(404).json({ message: 'Movie not found.' });
    }

    // PT: 204 = "No Content": deu certo, nada a devolver.
    // EN: 204 = "No Content": it worked, nothing to return.
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// =====================================================================
// DELETE /movies/:id
// =====================================================================
const deleteMovie = async (req, res) => {
  try {
    if (invalidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid movie id.' });
    }

    const response = await getDb()
      .collection(COLLECTION)
      .deleteOne({ _id: new ObjectId(req.params.id) });

    if (response.deletedCount === 0) {
      return res.status(404).json({ message: 'Movie not found.' });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAll, getSingle, createMovie, updateMovie, deleteMovie };
