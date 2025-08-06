const { Pool } = require('pg');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async getPlaylistById(id) {
    const query = {
      text: `SELECT
                json_build_object(
                    'id', p.id,
                    'name', p.name,
                    'songs', COALESCE(
                      json_agg(
                        json_build_object(
                          'id', s.id,
                          'title', s.title,
                          'performer', s.performer
                        )
                      ) FILTER (WHERE s.id IS NOT NULL), '[]'::json
                    )
                  )
              AS playlist
      FROM playlists p
      LEFT JOIN playlist_songs ps ON ps."playlistId" = p.id
      LEFT JOIN songs s ON s.id = ps."songId"
      WHERE p.id = $1
      GROUP BY p.id`,
      values: [id],
    };

    const result = await this._pool.query(query);

    return result.rows[0];
  }
}

module.exports = {
  PlaylistsService,
};
