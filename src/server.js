require('dotenv').config();

const Hapi = require('@hapi/hapi');
const { Pool } = require('pg');
const { AlbumService } = require('./services/AlbumService');
const albums = require('./api/albums');
const { AlbumsValidator } = require('./validator/albums');
const { ClientError } = require('./exceptions/ClientError');
const songs = require('./api/songs');
const { SongService } = require('./services/SongService');
const { SongsValidator } = require('./validator/songs');

const init = async () => {
  const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
  });

  const albumService = new AlbumService(pool);
  const songService = new SongService(pool);

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }

      if (!response.isServer) {
        return h.continue;
      }

      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  await server.register({
    plugin: albums,
    options: {
      service: albumService,
      validator: AlbumsValidator,
    },
  });

  await server.register({
    plugin: songs,
    options: {
      service: songService,
      validator: SongsValidator,
    },
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
