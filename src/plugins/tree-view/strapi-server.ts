// ==========================================
// TREE-VIEW PLUGIN (LOCAL)
// ==========================================
// Plugin locale per visualizzazione gerarchica ad albero dei contenuti.
// Permette di navigare e riorganizzare le collection con relazioni parent/child
// tramite interfaccia drag-and-drop nell'admin panel.
//
// Features:
// - Visualizzazione ad albero di collection con relazioni self-referencing
// - Drag-and-drop per riorganizzare la gerarchia
// - Supporto multi-collection (configurabile)
// - Integrato con Strapi v5 admin panel
//
// Endpoints admin:
// - GET /api/tree/:contentType - Ottiene l'albero gerarchico di una collection
// - POST /api/tree/:contentType/move - Sposta un nodo nell'albero
// ==========================================

// Strapi v5 local plugin server entrypoint for tree-view
import type { Core } from '@strapi/strapi';

// Helper to safely load routes array (admin).
const loadAdminRoutes = () => {
  try {
    const adminRoutes = require('./server/routes');
    if (Array.isArray(adminRoutes)) return adminRoutes;
    if (Array.isArray(adminRoutes.routes)) return adminRoutes.routes; // legacy shape
    return [];
  } catch (e) {
    return [];
  }
};

export default ({ strapi }: { strapi: Core.Strapi }) => {
  return {
    register() {

    },
    bootstrap() {

    },
    destroy() {

    },
    controllers: require('./server/controllers'),
    services: require('./server/services'),
    routes: {
      admin: loadAdminRoutes(),
    },
    contentTypes: {},
    policies: {},
    middlewares: {},
  };
};
