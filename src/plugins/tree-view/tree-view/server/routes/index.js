// Flat array of admin routes consumed directly by Strapi's registerPluginRoutes
module.exports = [
  {
    method: 'GET',
    path: '/ping',
    handler: 'test.ping',
    info: {
      type: 'content-api',
      description: 'Test endpoint for tree-view plugin',
    },
    config: { 
      policies: [],
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/tree',
    handler: 'tree.find',
    info: {
      type: 'content-api',
      description: 'Retrieve the full tree structure',
    },
    config: { 
      policies: [],
      auth: false, // Allow admin access without specific auth
    },
  },
  {
    method: 'GET',
    path: '/tree/children/:parentId',
    handler: 'tree.findChildren',
    info: {
      type: 'content-api',
      description: 'Retrieve children nodes for a parent',
    },
    config: { 
      policies: [],
      auth: false,
    },
  },
];
