import { ApolloServerPlugin } from '@apollo/server';
import { GraphQLError } from 'graphql';

const logger: ApolloServerPlugin = {
  // Fires whenever a GraphQL request is received from a client.
  async requestDidStart(requestContext) {
    const operationType = requestContext.request.operationName;
    const variables = requestContext.request.variables;
    console.log(`Execuing ${operationType}`);
    console.log(`Variables passed:`, variables);
    return {
      // Fires whenever Apollo Server will parse a GraphQL
      // request to create its associated document AST.
      async parsingDidStart() {
        console.log(`Parsing ${operationType}`);
      },
      // Fires whenever Apollo Server will validate a
      // request's document AST against your GraphQL schema.
      async validationDidStart() {
        console.log(`Validating ${operationType}`);
      },
      async didResolveOperation() {
        console.log(`Resolved ${operationType}`);
      },
      async didEncounterErrors() {
        console.error(
          `Error occured executing ${operationType}:\n${requestContext.errors}`,
        );
      },
    };
  },
};

export default logger;
