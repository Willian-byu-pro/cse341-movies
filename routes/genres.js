const router = require('express').Router();
const genresController = require('../controllers/genres');

// PT: Mesma estrutura de routes/movies.js, trocando o controller e a tag.
// EN: Same structure as routes/movies.js, with a different controller and tag.

router.get('/', (req, res) => {
  /*
    #swagger.tags = ['Genres']
    #swagger.summary = 'Get all genres'
    #swagger.description = 'Returns every genre stored in the genres collection.'
    #swagger.responses[200] = {
      description: 'An array of genres.',
      schema: [{ $ref: '#/definitions/GenreResponse' }]
    }
    #swagger.responses[500] = { description: 'Internal server error.' }
  */
  genresController.getAll(req, res);
});

router.get('/:id', (req, res) => {
  /*
    #swagger.tags = ['Genres']
    #swagger.summary = 'Get a genre by id'
    #swagger.description = 'Returns the genre that matches the MongoDB _id provided.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'MongoDB _id of the genre (24 hex characters).',
      required: true,
      type: 'string'
    }
    #swagger.responses[200] = { description: 'The genre found.', schema: { $ref: '#/definitions/GenreResponse' } }
    #swagger.responses[400] = { description: 'Invalid genre id.' }
    #swagger.responses[404] = { description: 'Genre not found.' }
    #swagger.responses[500] = { description: 'Internal server error.' }
  */
  genresController.getSingle(req, res);
});

router.post('/', (req, res) => {
  /*
    #swagger.tags = ['Genres']
    #swagger.summary = 'Create a new genre'
    #swagger.description = 'Creates a genre. All four fields are required and validated: name and description must be text, popularity must be a number between 1 and 10, and active must be a boolean (true or false, without quotes). Returns the new genre id.'
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'Genre to be created.',
      required: true,
      schema: { $ref: '#/definitions/Genre' }
    }
    #swagger.responses[201] = { description: 'Genre created. The new id is returned in the body.' }
    #swagger.responses[400] = { description: 'Validation failed. The response lists every invalid field.' }
    #swagger.responses[500] = { description: 'Internal server error.' }
  */
  genresController.createGenre(req, res);
});

router.put('/:id', (req, res) => {
  /*
    #swagger.tags = ['Genres']
    #swagger.summary = 'Update an existing genre'
    #swagger.description = 'Replaces the genre identified by the id. All four fields are required and validated, exactly as in the create route.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'MongoDB _id of the genre to update.',
      required: true,
      type: 'string'
    }
    #swagger.parameters['body'] = {
      in: 'body',
      description: 'New data for the genre.',
      required: true,
      schema: { $ref: '#/definitions/Genre' }
    }
    #swagger.responses[204] = { description: 'Genre updated successfully. No content returned.' }
    #swagger.responses[400] = { description: 'Invalid id or validation failed.' }
    #swagger.responses[404] = { description: 'Genre not found.' }
    #swagger.responses[500] = { description: 'Internal server error.' }
  */
  genresController.updateGenre(req, res);
});

router.delete('/:id', (req, res) => {
  /*
    #swagger.tags = ['Genres']
    #swagger.summary = 'Delete a genre'
    #swagger.description = 'Removes the genre identified by the id from the database.'
    #swagger.parameters['id'] = {
      in: 'path',
      description: 'MongoDB _id of the genre to delete.',
      required: true,
      type: 'string'
    }
    #swagger.responses[204] = { description: 'Genre deleted successfully. No content returned.' }
    #swagger.responses[400] = { description: 'Invalid genre id.' }
    #swagger.responses[404] = { description: 'Genre not found.' }
    #swagger.responses[500] = { description: 'Internal server error.' }
  */
  genresController.deleteGenre(req, res);
});

module.exports = router;
