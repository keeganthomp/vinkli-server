import dotenv from 'dotenv';
dotenv.config();

import { authenticateUser } from '@lib/supabase';
import { ContextT } from 'types/context';
import { GraphQLError } from 'graphql';
import db from '@db/index';
import { Request } from 'express';

//////////////////////////////////////////
// DO NOT USE THIS IN ANY
// ENVIRONMENT OTHER THAN DEVELOPMENT
//////////////////////////////////////////
const checkIfInstrospection = (req: Request) => {
  const isDev = process.env.NODE_ENV === 'development';
  if (!isDev) return false;
  const INTROSPECTION_SECRET = process.env.INTROSPECTION_SECRET;
  const hostName = req.hostname;
  const bearerToken = req.headers.authorization?.split(' ')[1];
  const isValidIntrospection =
    INTROSPECTION_SECRET &&
    hostName === 'localhost' &&
    bearerToken === INTROSPECTION_SECRET;
  return isValidIntrospection;
};

/**
 * Authenticate users
 * @returns user
 */
const authenticate = async ({ req }: { req: Request }): Promise<ContextT> => {
  // if the request is coming from our codegen script, we let it bypass check
  // this should only be available in development/local environment
  const isIntrospection = checkIfInstrospection(req);
  if (isIntrospection) {
    return {
      req,
      user: {
        userType: 'CUSTOMER',
      },
    } as ContextT;
  }

  // get tokens from headers
  const bearerToken = req.headers.authorization?.split(' ')[1];

  // throwing a `GraphQLError` here allows us to specify an HTTP status code,
  // standard `Error`s will have a 500 status code by default
  if (!bearerToken) {
    throw new GraphQLError('Auth token not provided', {
      extensions: {
        code: 'UNAUTHENTICATED',
        http: { status: 401 },
      },
    });
  }

  const authUser = await authenticateUser(bearerToken);

  if (!authUser) {
    // throwing a `GraphQLError` here allows us to specify an HTTP status code,
    // standard `Error`s will have a 500 status code by default
    throw new GraphQLError('User is not authenticated', {
      extensions: {
        code: 'UNAUTHENTICATED',
        http: { status: 401 },
      },
    });
  }

  const user = await db.query.users.findFirst({
    where: (user, { eq }) => eq(user.id, authUser.id),
  });

  if (!user) {
    throw new GraphQLError('User does not exist', {
      extensions: {
        code: 'UNAUTHENTICATED',
        http: { status: 401 },
      },
    });
  }

  // add the user to the context
  return { user, req };
};

export default authenticate;
