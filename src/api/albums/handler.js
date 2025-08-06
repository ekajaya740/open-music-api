const path = require('path');
const { StorageService } = require('../../services/StorageService');

class AlbumHandler {
  constructor(albumsService, albumsValidator, uploadsValidator) {
    this._albumsService = albumsService;
    this._storageService = new StorageService(path.resolve('public/albums/'));
    this._albumsValidator = albumsValidator;
    this._uploadsValidator = uploadsValidator;
  }

  async postAlbumHandler(request, h) {
    this._albumsValidator.validatePayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._albumsService.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId,
      },
    });

    response.code(201);

    return response;
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;

    const album = await this._albumsService.getAlbumById(id);

    const response = h.response({
      status: 'success',
      data: {
        album,
      },
    });

    response.code(200);

    return response;
  }

  async putAlbumByIdHandler(request, h) {
    this._albumsValidator.validatePayload(request.payload);
    const { id } = request.params;
    const { name, year } = request.payload;

    await this._albumsService.updateAlbumById(id, { name, year });

    const response = h.response({
      status: 'success',
      message: 'Album berhasil diperbarui',
    });
    response.code(200);

    return response;
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;

    await this._albumsService.deleteAlbumById(id);

    const response = h.response({
      status: 'success',
      message: 'Album berhasil dihapus',
    });

    response.code(200);

    return response;
  }

  async postAlbumCoverHandler(request, h) {
    const { cover } = request.payload;

    console.log(cover);

    this._uploadsValidator.validateImageHeaders(cover.hapi.headers);

    const { id } = request.params;

    await this._albumsService.getAlbumById(id);

    const filename = await this._storageService.writeFile(cover, cover.hapi);
    await this._albumsService.updateAlbumById(id, { cover: filename });

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    });

    response.code(201);

    return response;
  }
}

module.exports = { AlbumHandler };
