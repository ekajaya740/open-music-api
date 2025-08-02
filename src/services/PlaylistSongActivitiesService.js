const { nanoid } = require('nanoid');
const { InvariantError } = require('../exceptions/InvariantError');
const { NotFoundError } = require('../exceptions/NotFoundError');

class PlaylistSongActivitiesService {
  constructor(pool) {
    this._pool = pool;
  }

  async addPlaylistSongActivity({
    playlistId, songId, userId, action,
  }) {
    const id = `playlist-song-activity-${nanoid(16)}`;

    const time = new Date().toISOString();

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, time],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Aktivitas playlist lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylistSongActivities(playlistId) {
    const query = {
      text: 'SELECT u.username, s.title, ps.action, ps.time FROM playlist_song_activities ps LEFT JOIN users u ON u.id = ps."userId" LEFT JOIN songs s ON s.id = ps."songId" WHERE ps."playlistId" = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

module.exports = PlaylistSongActivitiesService;
