const { InvariantError } = require('../../exceptions/InvariantError');
const { PostPlaylistPayloadSchema, PostSongToPlaylistPayloadSchema } = require('./schema');

const PlaylistsValidator = {
  validatePostPayload: (payload) => {
    const result = PostPlaylistPayloadSchema.validate(payload);

    if (result.error) {
      throw new InvariantError(result.error.message);
    }
  },
  validatePostSongToPlaylistPayload: (payload) => {
    const result = PostSongToPlaylistPayloadSchema.validate(payload);

    if (result.error) {
      throw new InvariantError(result.error.message);
    }
  },
};

module.exports = { PlaylistsValidator };
