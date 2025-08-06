const path = require('path');
const { StorageService } = require('../../services/StorageService');
const { InvariantError } = require('../../exceptions/InvariantError');
const { NotFoundError } = require('../../exceptions/NotFoundError');

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

  async postLikeAlbumHandler(request, h) {
    const { id: albumId } = request.params;

    const { id: userId } = request.auth.credentials;

    const album = await this._albumsService.getAlbumById(albumId);

    if (!album) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    const isLiked = await this._albumsService.isUserHasLikedAlbum(albumId, userId);

    if (isLiked) {
      throw new InvariantError('Lagu sudah disukai');
    }

    await this._albumsService.likeAlbum(albumId, userId);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil disukai',
    });

    response.code(201);

    return response;
  }

  async deleteLikeAlbumHandler(request, h) {
    const { id: albumId } = request.params;

    const { id: userId } = request.auth.credentials;

    await this._albumsService.deleteAlbumLike(albumId, userId);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil dihapus dari daftar suka',
    });

    response.code(200);

    return response;
  }

  async getAlbumLikesHandler(request, h) {
    const { id: albumId } = request.params;

    const { likes, source } = await this._albumsService.getAlbumLikesCount(albumId);

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });

    if (source === 'cache') {
      response.header('X-Data-Source', 'cache');
    }

    response.code(200);

    return response;
  }
}

module.exports = { AlbumHandler };
