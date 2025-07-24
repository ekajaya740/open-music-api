require('dotenv').config();

const Hapi = require('@hapi/hapi');
const { Pool } = require('pg');
const { AlbumService } = require('./services/AlbumService');
const albums = require('./api/albums');
const { AlbumsValidator } = require('./validator/albums');
const { ClientError } = require('./exceptions/ClientError');

const init = async () => {
  const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
  });

  const albumService = new AlbumService(pool);

  const server = Hapi.server({
    port: process.env.API_PORT,
    host: process.env.NODE_ENV !== 'production' ? process.env.DEV_API_HOST : process.env.PROD_API_HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    }

    return h.continue;
  });

  await server.register({
    plugin: albums,
    options: {
      service: albumService,
      validator: AlbumsValidator,
      r: {
        prefix: '/albums',
      },
    },
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
