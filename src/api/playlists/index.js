const { PlaylistsHandler } = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlists',
  version: '1.0.0',
  register: async (server, {
    playlistsService,
    songsService,
    validator,
    authenticationsService,
    tokenManager,
    usersService,
    collaborationsService,
  }) => {
    const playlistsHandler = new PlaylistsHandler(
      playlistsService,
      songsService,
      validator,
      authenticationsService,
      tokenManager,
      usersService,
      collaborationsService,
    );
    server.route(routes(playlistsHandler));
  },
};
