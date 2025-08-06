class PlaylistsHandler {
  constructor(
    playlistsService,
    songsService,
    validator,
    authenticationsService,
    tokenManager,
    usersService,
    collaborationsService,
    playlistSongActivitiesService,
  ) {
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._validator = validator;
    this._authenticationsService = authenticationsService;
    this._tokenManager = tokenManager;
    this._usersService = usersService;
    this._collaborationsService = collaborationsService;
    this._playlistSongActivitiesService = playlistSongActivitiesService;
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPayload(request.payload);

    const { name } = request.payload;
    const { id: userId } = request.auth.credentials;

    const playlistId = await this._playlistsService.addPlaylist({ name, userId });

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
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

    const playlist = await this._playlistsService.getPlaylistById(id);

    if (playlist == null) {
      const response = h.response({
        status: 'fail',
        message: 'Playlist gagal dihapus. Id tidak ditemukan',
      });

      response.code(404);

      return response;
    }

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

    await this._playlistSongActivitiesService.addPlaylistSongActivity({
      playlistId,
      songId,
      userId: credentialId,
      action: 'add',
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

    const deletedSongId = await this._playlistsService.deleteSongFromPlaylist(playlistId, songId, credentialId);

    await this._playlistSongActivitiesService.addPlaylistSongActivity({
      playlistId,
      songId: deletedSongId,
      userId: credentialId,
      action: 'delete',
    });

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    });

    return response;
  }
}

module.exports = { PlaylistsHandler };
