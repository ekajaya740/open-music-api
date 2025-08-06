require('dotenv').config();

const Hapi = require('@hapi/hapi');
const { Pool } = require('pg');
const Jwt = require('@hapi/jwt');
const path = require('path');
const albums = require('./api/albums');
const { AlbumsService } = require('./services/AlbumsService');
const { AlbumsValidator } = require('./validator/albums');
const { UploadsValidator } = require('./validator/uploads');
const { ClientError } = require('./exceptions/ClientError');
const songs = require('./api/songs');
const { SongsService } = require('./services/SongsService');
const { SongsValidator } = require('./validator/songs');
const users = require('./api/users');
const { UsersService } = require('./services/UsersService');
const { UsersValidator } = require('./validator/users');
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const { AuthenticationsValidator } = require('./validator/authentications');
const playlists = require('./api/playlists');
const { PlaylistsService } = require('./services/PlaylistsService');
const { PlaylistsValidator } = require('./validator/playlists');
const CollaborationsService = require('./services/CollaborationsService');
const collaborations = require('./api/collaborations');
const PlaylistSongActivitiesService = require('./services/PlaylistSongActivitiesService');
const playlistSongActivities = require('./api/playlist_song_activities');
const _exports = require('./api/exports');
const ProducerService = require('./services/ProducerService');
const { ExportsValidator } = require('./validator/exports');

const init = async () => {
  const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
  });

  const playlistSongActivitiesService = new PlaylistSongActivitiesService(pool);
  const albumsService = new AlbumsService(pool);
  const songsService = new SongsService(pool);
  const usersService = new UsersService(pool);
  const authenticationsService = new AuthenticationsService(pool);
  const collaborationsService = new CollaborationsService(pool);
  const playlistsService = new PlaylistsService(pool, collaborationsService);
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
    debug: {
      log: ['error'],
      request: ['error', 'uncaught', 'unhandled'],
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
        status: 'fail',
        message: 'terjadi kegagalan pada server kami',
      });
      newResponse.code(500);
      return newResponse;
    }

    return h.continue;
  });

  await server.register({
    plugin: Jwt,
  });

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register(
    [
      {
        plugin: albums,
        options: {
          albumsService,
          albumsValidator: AlbumsValidator,
          uploadsValidator: UploadsValidator,
        },
      },
      {
        plugin: songs,
        options: {
          songsService,
          playlistSongActivitiesService,
          validator: SongsValidator,
        },
      },
      {
        plugin: users,
        options: {
          service: usersService,
          validator: UsersValidator,
        },
      },
      {
        plugin: authentications,
        options: {
          authenticationsService,
          usersService,
          tokenManager: TokenManager,
          validator: AuthenticationsValidator,
        },
      },
      {
        plugin: playlists,
        options: {
          playlistsService,
          songsService,
          validator: PlaylistsValidator,
          authenticationsService,
          tokenManager: TokenManager,
          usersService,
          collaborationsService,
          playlistSongActivitiesService,
        },
      },
      {
        plugin: collaborations,
        options: {
          collaborationsService,
          playlistsService,
          usersService,
        },
      },
      {
        plugin: playlistSongActivities,
        options: {
          playlistSongActivitiesService,
          playlistsService,
        },
      },
      {
        plugin: _exports,
        options: {
          producerService: ProducerService,
          playlistsService,
          validator: ExportsValidator,
        },
      },
    ],
  );

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
