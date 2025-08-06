const { nanoid } = require('nanoid');
const { NotFoundError } = require('../exceptions/NotFoundError');
const { InvariantError } = require('../exceptions/InvariantError');
const { CacheService } = require('./CacheService');

class AlbumsService {
  constructor(pool) {
    this._pool = pool;
    this._cacheService = new CacheService();
  }

  async addAlbum({ name, year }) {
    const id = nanoid(16);

    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, year, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    const albumQuery = {
      text: 'SELECT id, name, year, cover AS "coverUrl", "createdAt", "updatedAt" FROM albums WHERE id = $1',
      values: [id],
    };

    const songsQuery = {
      text: 'SELECT id, title, performer FROM songs WHERE "albumId" = $1',
      values: [id],

    };

    const album = await this._pool.query(albumQuery);

    const songs = await this._pool.query(songsQuery);

    if (!album.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const finalResult = {
      ...album.rows[0],
      songs: songs.rows,
    };

    return finalResult;
  }

  async updateAlbumById(id, { name, year, cover }) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: `UPDATE albums 
        SET 
          name = COALESCE($1, name), 
          year = COALESCE($2, year),
          cover = COALESCE($3, cover),
          "updatedAt" = $4
        WHERE id = $5 RETURNING id`,
      values: [name, year, cover, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album. Id tidak ditemukan');
    }

    return result.rows[0].id;
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan');
    }
  }

  async likeAlbum(albumId, userId) {
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, userId, albumId, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Like gagal ditambahkan');
    }

    await this._cacheService.del(`album-likes:${albumId}`);

    return result.rows[0].id;
  }

  async deleteAlbumLike(albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE "albumId" = $1 AND "userId" = $2 RETURNING id',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Like gagal dihapus. Id tidak ditemukan');
    }

    await this._cacheService.del(`album-likes:${albumId}`);
  }

  async getAlbumLikesCount(albumId) {
    try {
      const result = await this._cacheService.get(`album-likes:${albumId}`);

      return {
        likes: JSON.parse(result),
        source: 'cache',
      };
    } catch (e) {
      const query = {
        text: 'SELECT COUNT(*) AS likes FROM user_album_likes WHERE "albumId" = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);

      const likeCount = parseInt(result.rows[0].likes, 10);
      await this._cacheService.set(`album-likes:${albumId}`, JSON.stringify(likeCount));

      return {
        likes: likeCount,
        source: 'database',
      };
    }
  }

  async isUserHasLikedAlbum(albumId, userId) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE "albumId" = $1 AND "userId" = $2',
      values: [albumId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      return false;
    }

    return true;
  }
}

module.exports = { AlbumsService };
