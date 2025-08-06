const { ClientError } = require('./ClientError');

class RequestEntityTooLargeError extends ClientError {
  constructor(message) {
    super(message, 413);
    this.name = 'RequestEntityTooLargeError';
  }
}

module.exports = { RequestEntityTooLargeError };
