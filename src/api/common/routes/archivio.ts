export default {
  routes: [
    {
      method: 'GET',
      path: '/archivio/:contentType',
      handler: 'archivio.index',
      info: {
        type: 'content-api',
        description: 'Archive index for hierarchical date structure',
      },
      config: {
        auth: {
          scope: ['authenticated']
        }, 
        description: 'Universal archive endpoint - returns hierarchical date structure (year/month/day) for any content type',
        tags: ['Common', 'Archive'],
      },
    },
  ],
};
