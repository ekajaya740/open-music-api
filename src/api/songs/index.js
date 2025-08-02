const { SongHandler } = require('./handler');
const { routes } = require('./routes');

module.exports = {
  name: 'songs',
  version: '1.0.0',
  register: async (server, { songsService, playlistSongActivitiesService, validator }) => {
    const songHandler = new SongHandler(songsService, playlistSongActivitiesService, validator);
    server.route(routes(songHandler));
  },
};
