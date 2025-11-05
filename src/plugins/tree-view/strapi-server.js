// JS wrapper for Strapi to load plugin without TS compilation
// Pure JS plugin entry so Strapi can require it without TS transpilation.
// Local plugin: tree-view
const safeLoadAdminRoutes = () => {
	try {
		const r = require('./server/routes');
		if (Array.isArray(r)) return r;
		if (Array.isArray(r.routes)) return r.routes;
		return [];
	} catch (e) {
		return [];
	}
};

module.exports = {
	register({ strapi }) {

		// Register plugin routes directly in Strapi's admin router
		const routes = safeLoadAdminRoutes();

		// Add routes to admin router if available
		if (strapi.server && strapi.server.router) {
			routes.forEach(route => {
				const fullPath = `/admin/plugins/tree-view${route.path}`;

				strapi.server.router[route.method.toLowerCase()](fullPath, async (ctx, next) => {

					// Get controller
					const controller = strapi.plugin('tree-view').controller(route.handler.split('.')[0]);
					const action = route.handler.split('.')[1];
					
					if (controller && controller[action]) {
						await controller[action](ctx, next);
					} else {
						ctx.status = 404;
						ctx.body = { error: `Handler ${route.handler} not found` };
					}
				});
			});
		}
	},
	bootstrap({ strapi }) {

	},
	destroy({ strapi }) {

	},
	controllers: require('./server/controllers'),
	services({ strapi }) {
		const raw = require('./server/services');
		// normalize potential factory style exports
		const normalized = {};
		for (const [k, v] of Object.entries(raw)) {
			normalized[k] = typeof v === 'function' ? v({ strapi }) : v;
		}
		return normalized;
	},
	// Keep original routes structure as fallback
	routes: {
		admin: {
			type: 'admin',
			routes: safeLoadAdminRoutes(),
		},
	},
	contentTypes: {},
	policies: {},
	middlewares: {},
};
