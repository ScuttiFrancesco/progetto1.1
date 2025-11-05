// path: src/api/pagina/routes/0-custom-pagina.ts

export default {
  routes: [
    {
      method: "GET",
      path: "/pagina/tree/:slug",
      handler: "pagina.getTree",
      info: {
        type: "content-api",
        description: "Retrieve full hierarchy for a page tree",
      },
      config: {
        auth: {
          scope: ["authenticated"],
        },
      },
    },
    {
      method: "GET",
      path: "/pagina/children/:slug",
      handler: "pagina.getChildren",
      info: {
        type: "content-api",
        description: "List direct children for a page",
      },
      config: {
        auth: {
          scope: ["authenticated"],
        },
      },
    },
    {
      method: "GET",
      path: "/pagina/subtree/:slug",
      handler: "pagina.getSubtree",
      info: {
        type: "content-api",
        description: "Retrieve subtree data starting from a page",
      },
      config: {
        auth: false,
      },
    },
  ],
};
