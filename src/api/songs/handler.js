class SongHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async getSongsHandler(request, h) {
    const q = request.query;

    const songs = await this._service.getSongs(q);

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

    const songId = await this._service.addSong(body);

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

    const song = await this._service.getSongById(id);

    console.log('ID', song);

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

    await this._service.updateSongById(id, body);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil diperbarui',
    });
    response.code(200);

    return response;
  }

  async deleteSongByIdHandler(request, h) {
    const { id } = request.params;

    await this._service.deleteSongById(id);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil dihapus',
    });

    response.code(200);

    return response;
  }
}

module.exports = { SongHandler };
