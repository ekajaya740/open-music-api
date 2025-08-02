class PlaylistsHandler {
  constructor(
    playlistsService,
    songsService,
    validator,
    authenticationsService,
    tokenManager,
    usersService,
    collaborationsService,
  ) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._validator = validator;
    this._authenticationsService = authenticationsService;
    this._tokenManager = tokenManager;
    this._usersService = usersService;
    this._collaborationsService = collaborationsService;
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPayload(request.payload);

    const { name } = request.payload;
    const { id: userId } = request.auth.credentials;

    const playlisId = await this._playlistsService.addPlaylist({ name, userId });

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId: playlisId,
      },
    });
    response.code(201);

    return response;
  }

  async getPlaylistsHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const playlists = await this._playlistsService.getPlaylists(userId);

    const response = h.response({
      status: 'success',
      data: {
        playlists,
      },
    });
    response.code(200);

    return response;
  }

  async deletePlaylistHandler(request, h) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(id, credentialId);
    await this._playlistsService.deletePlaylist(id);

    const response = h.response({

      status: 'success',
      message: 'Playlist berhasil dihapus',
    });

    return response;
  }

  async postSongToPlaylistHandler(request, h) {
    this._validator.validatePostSongToPlaylistPayload(request.payload);

    const { id: credentialId } = request.auth.credentials;

    const { songId } = request.payload;
    const { id: playlistId } = request.params;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
    await this._songsService.getSongById(songId);

    await this._playlistsService.addSongToPlaylist({
      playlistId,
      songId,
      userId: credentialId,
    });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);

    return response;
  }

  async getSongsFromPlaylistHandler(request, h) {
    const playlistId = request.params.id;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const playlist = await this._playlistsService.getPlaylistById(playlistId);

    const songs = await this._playlistsService.getSongsFromPlaylist(playlistId);

    const response = h.response({
      status: 'success',
      data: {
        playlist: {
          id: playlist.id,
          name: playlist.name,
          username: playlist.username,
          songs,
        },
      },
    });

    return response;
  }

  async deleteSongFromPlaylistHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);

    const { songId } = request.payload;

    await this._playlistsService.deleteSongFromPlaylist(playlistId, songId);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    });

    return response;
  }
}

module.exports = { PlaylistsHandler };
