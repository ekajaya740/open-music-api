const { AlbumHandler } = require('./handler');
const { routes } = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, {
    albumsService, albumsValidator, uploadsValidator,
  }) => {
    const albumHandler = new AlbumHandler(albumsService, albumsValidator, uploadsValidator);
    server.route(routes(albumHandler));
  },
};
