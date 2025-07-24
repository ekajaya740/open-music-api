const { InvariantError } = require('../../exceptions/InvariantError');
const { AlbumPayloadSchema } = require('./schema');

const AlbumsValidator = {
  validateAlbumPayload: (payload) => {
    const result = AlbumPayloadSchema.validate(payload);

    if (result.error) {
      console.log('H');
      throw new InvariantError(result.error.message);
    }
  },
};

module.exports = { AlbumsValidator };
