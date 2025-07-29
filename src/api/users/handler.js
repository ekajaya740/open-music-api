class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
  }

  async postUserHandler(request, h) {
    this._validator.validatePayload(request.payload);

    const body = request.payload;

    try {
      const userId = await this._service.addUser(body);

      const response = h.response({
        status: 'success',
        data: {
          userId,
        },
      });

      response.code(200);

      return response;
    } catch (e) {
      if (e instanceof Error) {
        if (e.code && e.code === '23505') {
          const response = h.response({
            status: 'fail',
            message: 'Gagal menambahkan user. Username sudah digunakan',
          });

          response.code(400);

          return response;
        }

        const response = h.response({
          status: 'fail',
          message: e.message,
        });

        response.code(400);

        return response;
      }
    }
  }
}

module.exports = { UsersHandler };
