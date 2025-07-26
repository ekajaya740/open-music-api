class ClientError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = 'ClientError';
    this.statusCode = statusCode;
  }
}

module.exports = { ClientError };
