export default {
  routes: [
    {
      method: 'POST',
      path: '/publish/:contentType/:documentId',
      handler: 'publish.publish',
      info: {
        type: 'content-api',
        description: 'Publish draft entries by content type and id',
      },
      config: {
        auth: {
          scope: ['authenticated']
        }, 
        description: 'Universal publish endpoint - publishes any draft document by contentType and documentId',
        tags: ['Common', 'Publish'],
      },
    },
  ],
};
