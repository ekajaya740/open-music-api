class ExportsHandler {
  constructor(producerService, playlistsService, validator) {
    this._producerService = producerService;
    this._playlistsService = playlistsService;
    this._validator = validator;
  }

  async postExportPlaylistHandler(request, h) {
    await this._validator.validateExportNotesPayload(request.payload);

    await this._playlistsService.verifyPlaylistOwner(request.params.playlistId, request.auth.credentials.id);

    await this._playlistsService.getPlaylistById(request.params.playlistId);

    const message = {
      playlistId: request.params.playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this._producerService.sendMessage('export:playlist', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda dalam antrean',
    });
    response.code(201);
    return response;
  }
}

module.exports = { ExportsHandler };
