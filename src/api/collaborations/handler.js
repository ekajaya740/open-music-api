class CollaborationsHandler {
  constructor(collaborationsService, playlistsService, usersService) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._usersService = usersService;
  }

  async postCollaborationHandler(request, h) {
    const { playlistId, userId } = request.payload;

    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    await this._usersService.getUserById(userId);

    const {
      id: collaborationId,
    } = await this._collaborationsService.addCollaboration(playlistId, userId);

    const response = h.response({
      status: 'success',
      data: {
        collaborationId,
      },
    });
    response.code(201);

    return response;
  }

  async deleteCollaborationHandler(request, h) {
    const { playlistId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

    await this._collaborationsService.deleteCollaboration(playlistId, userId);

    const response = h.response({
      status: 'success',
      message: 'Kolaborasi berhasil dihapus',
    });

    response.code(200);

    return response;
  }

  // async verifyCollaborationHandler(request, h) { }
}

module.exports = { CollaborationsHandler };
