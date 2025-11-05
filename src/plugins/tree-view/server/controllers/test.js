/**
 * Test controller per verificare che le routes funzionino
 */

module.exports = {
  async ping(ctx) {
    ctx.body = { status: 'ok', message: 'Tree View plugin is working', timestamp: new Date().toISOString() };
  },
};
