/* eslint-disable no-console */
const express = require("express");
const { Nuxt, Builder } = require('nuxt')
const { createServer } = require("http");
const chalk = require("chalk");
const sharedUtils = require("./utils");
const middleware = require("./middleware");
const packageJson = require("../package");

/*
  * Our Express server
  */
const app = express();

sharedUtils.sanitiseEnv();
// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
const isDev = !(process.env.NODE_ENV === "production");

async function main() {

  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const { host, port } = nuxt.options.server
  const PORT = port;
  /*
   * Getting access to the HTTP server directly means that we can do things
   * with websockets if we need to (e.g. GraphQL subscriptions).
   */
  // Build only in dev mode
  if (isDev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  // Give nuxt middleware to express
  app.use(nuxt.render)

  const httpServer = createServer(app);
  app.set("httpServer", httpServer);

  /*
   * When we're using websockets, we may want them to have access to
   * sessions/etc for authentication.
   */
  const websocketMiddlewares = [];
  app.set("websocketMiddlewares", websocketMiddlewares);

  /*
   * Middleware is installed from the /server/middleware directory. These
   * helpers may augment the express app with new settings and/or install
   * express middleware. These helpers may be asynchronous, but they should
   * operate very rapidly to enable quick as possible server startup.
   */
  await middleware.installDatabasePools(app);
  await middleware.installSession(app);
  await middleware.installPassport(app);
  await middleware.installLogging(app);
  // These are our assets: images/etc; served out of the /client/public folder
  await middleware.installSharedStatic(app);
  await middleware.installPostGraphile(app);

  // And finally, we open the listen port
  httpServer.listen(PORT, () => {
    const address = httpServer.address();
    debugger;
    const actualPort =
      typeof address === "string" ? address : address.port || PORT;
    console.log();
    console.log(
      chalk.green(
        `${chalk.bold(packageJson.name)} listening on port ${chalk.bold(
          actualPort
        )}`
      )
    );
    console.log();
    console.log(
      `  Site:     ${chalk.bold.underline(`http://localhost:${actualPort}`)}`
    );
    console.log(
      `  GraphiQL: ${chalk.bold.underline(
        `http://localhost:${actualPort}/graphiql`
      )}`
    );
    console.log();
  });
}

main().catch(e => {
  console.error("Fatal error occurred starting server!");
  console.error(e);
  process.exit(1);
});
