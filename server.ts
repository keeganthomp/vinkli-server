import dotenv from 'dotenv';
dotenv.config();

// express server
import { readdirSync, readFileSync } from 'fs';
import express from 'express';
import http from 'http';
import cors from 'cors';
import bp from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
// graphql things
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { ContextT } from 'types/context';
import { ApolloServerErrorCode } from '@apollo/server/errors';
import scalars from '@graphql/scalars';
import logger from './logger';
import resolvers from '@graphql/resolvers';
import authenticate from '@auth';

const isProduction = process.env.NODE_ENV === 'production';

// Construct __dirname in ES module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Function to determine the correct file extension based on the environment
const getFileExtension = () => (isProduction ? '.js' : '.ts');

// webhooks directory
const webhooksDir = path.join(__dirname, 'webhook');

const PORT = 4000;
const app = express();
const webhookRouter = express.Router();

// Our httpServer handles incoming requests to our Express app.
// Below, we tell Apollo Server to "drain" this httpServer,
// enabling our servers to shut down gracefully.
const httpServer = http.createServer(app);

const apolloPlugins = [
  logger,
  ApolloServerPluginDrainHttpServer({ httpServer }),
];
if (isProduction) {
  apolloPlugins.push(ApolloServerPluginLandingPageDisabled());
}

const schemaFiles = readdirSync('./graphql/schema', 'utf8');
const typeDefs = schemaFiles.map((file) =>
  readFileSync(`./graphql/schema/${file}`, 'utf8'),
);
const server = new ApolloServer<ContextT>({
  typeDefs,
  status400ForVariableCoercionErrors: true,
  resolvers: [...resolvers, scalars],
  plugins: apolloPlugins,
  formatError: (formattedError, error) => {
    // Return a different error message
    if (
      formattedError?.extensions?.code ===
      ApolloServerErrorCode?.GRAPHQL_VALIDATION_FAILED
    ) {
      return {
        ...formattedError,
        message: "Your query doesn't match the schema. Try double-checking it!",
      };
    }
    // Otherwise return the formatted error. This error can also
    // be manipulated in other ways, as long as it's returned.
    return formattedError;
  },
});

// start server
await server.start();

// Dynamically import all webhooks
readdirSync(webhooksDir).forEach((file) => {
  if (file.endsWith(getFileExtension())) {
    // Dynamically import ES modules
    import(path.join(webhooksDir, file)).then((webhookModule) => {
      webhookRouter.use(webhookModule.default);
    });
  }
});
// register webhooks
app.use('/webhook', webhookRouter);

// configure graphql endpoint
app.use(
  '/graphql',
  cors<cors.CorsRequest>(),
  bp.json(),
  expressMiddleware(server, {
    context: authenticate,
  }),
);

await new Promise<void>((resolve) =>
  httpServer.listen({ port: PORT }, resolve),
);

console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
