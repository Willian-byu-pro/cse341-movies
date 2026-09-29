const router = require('express').Router();
const moviesController = require('../controllers/movies');

// PT: Cada rota tem um corpo para as anotacoes #swagger. Elas viram a
//     documentacao quando voce roda "npm run swagger".
// EN: Each route has a body to hold the #swagger annotations. They become
//     the documentation when you run "npm run swagger".

router.get('/', (req, res) => {
  /*
    #swagger.tags = ['Movies']
    #swagger.summary = 'Get all movies'
    #swagger.description = 'Returns every movie stored in the movies collection.'
    #swagger.responses[200] = {
      description: 'An array of movies.',
      schema: [{ $ref: '#/definitions/MovieResponse' }]
    }
    #swagger.responses[500] = { description: 'Internal server error.' }
  */
  moviesController.getAll(req, res);
});

router.get('/:id', (req, res) => {
  /*
    #swagger.tags = ['Movies']
    #swagger.summary = 'Get a movie by id'
    #swagger.description = 'Returns the movie that matches the MongoDB _id provided.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'MongoDB _id of the movie (24 hex characters).',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = { description: 'The movie found.', schema: { $ref: '#/definitions/MovieResponse' } }
    #swagger.responses[400] = { description: 'Invalid movie id.' }
    #swagger.responses[404] = { description: 'Movie not found.' }
    #swagger.responses[500] = { description: 'Internal server error.' }
  */
  moviesController.getSingle(req, res);
});

router.post('/', (req, res) => {
  /*
    #swagger.tags = ['Movies']
    #swagger.summary = 'Create a new movie'
    #swagger.description = 'Creates a movie. All eight fields are required and validated: year must be an integer between 1888 and the current year plus five, duration must be greater than zero, and rating must be between 0 and 10. Returns the new movie id.'
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Movie to be created.',
      required: true,
      schema: { $ref: '#/definitions/Movie' }
    }
    #swagger.responses[201] = { description: 'Movie created. The new id is returned in the body.' }
    #swagger.responses[400] = { description: 'Validation failed. The response lists every invalid field.' }
    #swagger.responses[500] = { description: 'Internal server error.' }
  */
  moviesController.createMovie(req, res);
});

router.put('/:id', (req, res) => {
  /*
    #swagger.tags = ['Movies']
    #swagger.summary = 'Update an existing movie'
    #swagger.description = 'Replaces the movie identified by the id. All eight fields are required and validated, exactly as in the create route.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'MongoDB _id of the movie to update.',
      required: true,
      type: 'string'
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'New data for the movie.',
      required: true,
      schema: { $ref: '#/definitions/Movie' }
    }
    #swagger.responses[204] = { description: 'Movie updated successfully. No content returned.' }
    #swagger.responses[400] = { description: 'Invalid id or validation failed.' }
    #swagger.responses[404] = { description: 'Movie not found.' }
    #swagger.responses[500] = { description: 'Internal server error.' }
  */
  moviesController.updateMovie(req, res);
});

router.delete('/:id', (req, res) => {
  /*
    #swagger.tags = ['Movies']
    #swagger.summary = 'Delete a movie'
    #swagger.description = 'Removes the movie identified by the id from the database.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'MongoDB _id of the movie to delete.',
      required: true,
      type: 'string'
    }
    #swagger.responses[204] = { description: 'Movie deleted successfully. No content returned.' }
    #swagger.responses[400] = { description: 'Invalid movie id.' }
    #swagger.responses[404] = { description: 'Movie not found.' }
    #swagger.responses[500] = { description: 'Internal server error.' }
  */
  moviesController.deleteMovie(req, res);
});

module.exports = router;
