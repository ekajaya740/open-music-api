const { nanoid } = require('nanoid');
const { NotFoundError } = require('../exceptions/NotFoundError');
const { InvariantError } = require('../exceptions/InvariantError');

class SongsService {
  constructor(pool) {
    this._pool = pool;
  }

  async addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = nanoid(16);

    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO songs (id, title, year, genre, performer, duration, "albumId", "createdAt", "updatedAt") VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId, createdAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs({ title, performer }) {
    let queryText = 'SELECT id, title, performer FROM songs WHERE "deletedAt" IS NULL';
    const values = [];
    const conditions = [];

    if (title) {
      values.push(`%${title.toLowerCase()}%`);
      conditions.push(`LOWER(title) LIKE $${values.length}`); // $1, $2, etc.
    }

    if (performer) {
      values.push(`%${performer.toLowerCase()}%`);
      conditions.push(`LOWER(performer) LIKE $${values.length}`); // $1, $2, etc.
    }

    if (conditions.length > 0) {
      queryText += ` AND ${conditions.join(' AND ')}`;
    }

    const result = await this._pool.query(queryText, values);
    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT id, title, year, performer, genre, duration, "albumId" FROM songs WHERE id = $1 AND "deletedAt" IS NULL',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows[0];
  }

  async updateSongById(id, {
    title, year, genre, performer, duration = null, albumId = null,
  }) {
    const updatedAt = new Date().toISOString();

    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, "albumId" = $6, "updatedAt" = $7 WHERE id = $8 AND "deletedAt" IS NULL RETURNING id',
      values: [
        title, year, genre, performer, duration, albumId, updatedAt, id,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui lagu. Id tidak ditemukan');
    }

    return result.rows[0].id;
  }

  async deleteSongById(id) {
    const query = {
      text: 'UPDATE songs SET "deletedAt" = NOW() WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = { SongsService };
