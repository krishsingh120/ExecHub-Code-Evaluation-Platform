const v1Router = require("../api/v1/v1Routes");

async function apiPlugins(fastify, Option) {
  await fastify.register(v1Router, { prefix: "/v1" });
}

module.exports = apiPlugins;
