export default {
  routes: [
    {
      method: 'POST',
      path: '/unpublish/:contentType/:documentId',
      handler: 'unpublish.unpublish',
      info: {
        type: 'content-api',
        description: 'Unpublish entries by content type and id',
      },
      config: {
        auth: {
          scope: ['authenticated']
        }, 
        description: 'Universal unpublish endpoint - unpublishes any document by contentType and documentId',
        tags: ['Common', 'Unpublish'],
      },
    },
  ],
};
