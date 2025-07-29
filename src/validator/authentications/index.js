const { InvariantError } = require('../../exceptions/InvariantError');
const { PostAuthenticationPayloadSchema, PutAuthenticationPayloadSchema, DeleteAuthenticationPayloadSchema } = require('./schema');

const AuthenticationsValidator = {
  validatPostPayload: (payload) => {
    const result = PostAuthenticationPayloadSchema.validate(payload);

    if (result.error) {
      throw new InvariantError(result.error.message);
    }
  },
  validatePutPayload: (payload) => {
    const result = PutAuthenticationPayloadSchema.validate(payload);

    if (result.error) {
      throw new InvariantError(result.error.message);
    }
  },
  validateDeletePayload: (payload) => {
    const result = DeleteAuthenticationPayloadSchema.validate(payload);

    if (result.error) {
      throw new InvariantError(result.error.message);
    }
  },

};

module.exports = { AuthenticationsValidator };
