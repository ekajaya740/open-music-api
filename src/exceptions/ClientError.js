class ClientError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ClientError';
    this.statusCode = 500;
  }
}

module.exports = { ClientError };
