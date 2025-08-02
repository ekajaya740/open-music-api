class SongHandler {
  constructor(songsService, playlistSongActivitiesService, validator) {
    this._songsService = songsService;
    this._playlistSongActivitiesService = playlistSongActivitiesService;
    this._validator = validator;
  }

  async getSongsHandler(request, h) {
    const q = request.query;

    const songs = await this._songsService.getSongs(q);

    const response = h.response({
      status: 'success',
      data: {
        songs,
      },
    });

    response.code(200);

    return response;
  }

  async postSongHandler(request, h) {
    this._validator.validatePayload(request.payload);
    const body = request.payload;

    const songId = await this._songsService.addSong(body);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan',
      data: {
        songId,
      },
    });

    response.code(201);

    return response;
  }

  async getSongByIdHandler(request, h) {
    const { id } = request.params;

    const song = await this._songsService.getSongById(id);

    const response = h.response({
      status: 'success',
      data: {
        song,
      },
    });

    response.code(200);

    return response;
  }

  async putSongByIdHandler(request, h) {
    this._validator.validatePayload(request.payload);
    const { id } = request.params;
    const body = request.payload;

    await this._songsService.updateSongById(id, body);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil diperbarui',
    });
    response.code(200);

    return response;
  }

  async deleteSongByIdHandler(request, h) {
    const { id } = request.params;

    const song = await this._songsService.getSongById(id);

    if (song == null) {
      const response = h.response({
        status: 'fail',
        message: 'Lagu gagal dihapus. Id tidak ditemukan',
      });

      response.code(404);

      return response;
    }

    await this._songsService.deleteSongById(id);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil dihapus',
    });

    response.code(200);

    return response;
  }
}

module.exports = { SongHandler };
