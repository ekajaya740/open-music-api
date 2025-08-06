const { nanoid } = require('nanoid');
const { InvariantError } = require('../exceptions/InvariantError');
const { NotFoundError } = require('../exceptions/NotFoundError');
const { AuthorizationError } = require('../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(pool, collaborationsService) {
    this._pool = pool;
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, userId }) {
    const id = `playlist-${nanoid(16)}`;

    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, userId, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(userId) {
    const query = {
      text: `SELECT p.id, p.name, u.username
      FROM playlists p
      LEFT JOIN collaborations c ON c."playlistId" = p.id
      LEFT JOIN users u ON u.id = p.owner
      WHERE p.owner = $1 OR c."userId" = $1`,
      values: [userId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }


  async deletePlaylist(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    await this._pool.query(query);
  }

  async addSongToPlaylist({ playlistId, songId, userId }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, playlistId, songId, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }

    return result.rows[0].id;
  }

  async getSongsFromPlaylist(playlistId) {
    const songsQuery = {
      text: `
      SELECT s.id, s.title, s.performer
      FROM playlist_songs ps
      LEFT JOIN songs s ON s.id = ps."songId"
      WHERE ps."playlistId" = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(songsQuery);

    return result.rows;
  }

  async getPlaylistById(id) {
    const query = {
      text: `SELECT p.id, p.name, u.username, s.id AS "songId", s.title, s.performer
         FROM playlists p
         LEFT JOIN users u ON u.id = p.owner
         LEFT JOIN playlist_songs ps ON ps."playlistId" = p.id
         LEFT JOIN songs s ON s.id = ps."songId"
         WHERE p.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }

  async deleteSongFromPlaylist(playlistId, songId, userId) {
    const checkQuery = {
      text: 'SELECT id FROM playlist_songs WHERE "playlistId" = $1 AND "songId" = $2',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(checkQuery);

    if (!result.rows.length) {
      throw new InvariantError('Lagu tidak ditemukan');
    }

    const query = {
      text: 'DELETE FROM playlist_songs WHERE "playlistId" = $1 AND "songId" = $2 RETURNING "songId"',
      values: [playlistId, songId],
    };

    const deletedSong = await this._pool.query(query);

    return deletedSong.rows[0].songId;
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }
}

module.exports = {
  PlaylistsService,
};
