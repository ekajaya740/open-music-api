const routes = (handler, r) => [
  {
    method: 'POST',
    path: `${r.prefix}`,
    handler: handler.postAlbumHandler,
  },
  {
    method: 'GET',
    path: `${r.prefix}/{id}`,
    handler: handler.getAlbumByIdHandler,
  },
  {
    method: 'PUT',
    path: `${r.prefix}/{id}`,
    handler: handler.putAlbumByIdHandler,
  },
  {
    method: 'DELETE',
    path: `${r.prefix}/{id}`,
    handler: handler.deleteAlbumByIdHandler,
  },
];

module.exports = { routes };
