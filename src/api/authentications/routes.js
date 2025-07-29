const routes = () => [
  {
    method: 'POST',
    path: '/authentications',
    handler: (handler, h) => handler.postAuthenticationHandler(handler, h),
  },
  {
    method: 'PUT',
    path: '/authentications',
    handler: (handler, h) => handler.putAuthenticationHandler(handler, h),
  },
  {
    method: 'DELETE',
    path: '/authentications',
    handler: (handler, h) => handler.deleteAuthenticationHandler(handler, h),
  },
];

module.exports = routes;
