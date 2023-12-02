import { GraphQLError } from 'graphql';
import { Resolvers } from 'types/graphql';
import db from '@db/index';
import { tattoo as tattooSchema } from 'db/schema/tattoo';
import { generateImageUrls } from 'utils/image';
import { StorageBucket } from 'types/storage';
import { asc, desc, eq } from 'drizzle-orm';

const resolvers: Resolvers = {
  Query: {
    customerTattoos: async (_, __, { user }) => {
      if (user.userType !== 'CUSTOMER') {
        throw new GraphQLError('User is not a customer');
      }
      const tattoos = await db.query.tattoo.findMany({
        where: (tattoo, { eq }) => eq(tattoo.userId, user.id),
        orderBy: (tattoo) => desc(tattoo.createdAt),
        with: {
          customer: true,
          appointments: {
            orderBy: (appointment) => asc(appointment.createdAt),
            with: {
              artist: true,
            },
          },
        },
      });
      return tattoos.map((tattoo) => ({
        ...tattoo,
        id: tattoo.id,
        imageUrls: generateImageUrls(tattoo.imagePaths, StorageBucket.TATTOOS),
        consultation: tattoo.appointments.find(
          (appointment) => appointment.type === 'CONSULTATION',
        ),
        sessions: tattoo.appointments.filter(
          (appointment) => appointment.type === 'TATTOO_SESSION',
        ),
      }));
    },
  },
  Mutation: {
    customerCreateTattoo: async (_, { input }, { user: currentUser }) => {
      if (currentUser.userType !== 'CUSTOMER') {
        throw new GraphQLError('User is not a customer');
      }
      const [newTattoo] = await db
        .insert(tattooSchema)
        .values({
          ...input,
          userId: currentUser.id,
          imagePaths: input.imagePaths || [],
        })
        .returning();
      return {
        ...newTattoo,
        imageUrls: generateImageUrls(
          newTattoo.imagePaths,
          StorageBucket.TATTOOS,
        ),
      };
    },
  },
};

export default resolvers;
