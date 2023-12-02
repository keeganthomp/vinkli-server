import { Kind, GraphQLScalarType } from 'graphql';

// custom scalar for date
const dateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value) {
    if (value instanceof Date) {
      return value.getTime(); // Convert outgoing Date to integer for JSON
    }
    throw Error('GraphQL Date Scalar serializer expected a `Date` object');
  },
  parseValue(value) {
    if (typeof value === 'number') {
      return new Date(value); // Convert incoming integer to Date
    }
    throw new Error('GraphQL Date Scalar parser expected a `number`');
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      // Convert hard-coded AST string to integer and then to Date
      return new Date(parseInt(ast.value, 10));
    }
    // Invalid hard-coded value (not an integer)
    return null;
  },
});

// custom JSON scalar
const JSONType = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON data type',

  // Serialize converts a JavaScript object to JSON string
  serialize(value) {
    return JSON.stringify(value);
  },

  // ParseValue converts a JSON string to a JavaScript object
  parseValue(value) {
    try {
      if (typeof value === 'string') {
        return JSON.parse(value);
      }
      throw new Error('JSON scalar expected a string');
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  },

  // ParseLiteral converts a JSON AST node to a JavaScript object
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      try {
        return JSON.parse(ast.value);
      } catch (error) {
        throw new Error('Invalid JSON format');
      }
    }
    throw new Error('JSON must be a string');
  },
});

const scalars = {
  Date: dateScalar,
  JSON: JSONType,
};

export default scalars;
