/**
 * Path Resolver Routes
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/resolve-path/stats',
      handler: 'path-resolver.stats',
      info: {
        type: 'content-api',
        description: 'Path resolver cache statistics',
      },
      config: {
        auth: {
          scope: ['authenticated']
        }, 
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/resolve-path/invalidate',
      handler: 'path-resolver.invalidate',
      info: {
        type: 'content-api',
        description: 'Invalidate cached path entries',
      },
      config: {
        auth: {
          scope: ['authenticated']
        }, 
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/resolve-path/:path*',
      handler: 'path-resolver.resolve',
      info: {
        type: 'content-api',
        description: 'Resolve a public path to content metadata',
      },
      config: {
       auth: {
          scope: ['authenticated']
        }, 
        policies: [],
        middlewares: [],
      },
    },
  ],
};
