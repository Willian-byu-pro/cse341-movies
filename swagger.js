require('dotenv').config();
const swaggerAutogen = require('swagger-autogen')();

// PT: Em producao defina SWAGGER_HOST no Render com a URL REAL do servico.
//     Licao do projeto anterior: a URL nem sempre e o nome do servico.
// EN: In production set SWAGGER_HOST on Render with the REAL service URL.
//     Lesson from the previous project: the URL is not always the service name.
const host = process.env.SWAGGER_HOST || 'localhost:3000';
const isLocal = host.startsWith('localhost');

const doc = {
  info: {
    title: 'CSE 341 - Movies API',
    description:
      'API for managing movies and genres. Built for the Week 03-04 project of CSE 341 (BYU-Idaho). Every route performs validation and error handling.',
    version: '1.0.0'
  },
  host: host,
  basePath: '/',
  schemes: isLocal ? ['http'] : ['https'],
  consumes: ['application/json'],
  produces: ['application/json'],

  // PT: Duas tags = duas secoes separadas na pagina do Swagger.
  // EN: Two tags = two separate sections on the Swagger page.
  tags: [
    { name: 'Movies', description: 'Create, read, update and delete movies' },
    { name: 'Genres', description: 'Create, read, update and delete genres' }
  ],

  definitions: {
    Movie: {
      $title: 'City of God',
      $director: 'Fernando Meirelles',
      $year: 2002,
      $genre: 'Crime',
      $duration: 130,
      $rating: 8.6,
      $language: 'Portuguese',
      $synopsis: 'Two boys growing up in a violent neighborhood of Rio de Janeiro take different paths.'
    },
    MovieResponse: {
      _id: '6abae746ccd5884aaa55b26d',
      title: 'City of God',
      director: 'Fernando Meirelles',
      year: 2002,
      genre: 'Crime',
      duration: 130,
      rating: 8.6,
      language: 'Portuguese',
      synopsis: 'Two boys growing up in a violent neighborhood of Rio de Janeiro take different paths.'
    },
    Genre: {
      $name: 'Crime',
      $description: 'Films centered on criminal activity',
      $popularity: 8,
      $active: true
    },
    GenreResponse: {
      _id: '6abafce7ee75cb194596c648',
      name: 'Crime',
      description: 'Films centered on criminal activity',
      popularity: 8,
      active: true
    }
  }
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./routes/index.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);
