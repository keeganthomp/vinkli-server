import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: './graphql/schema',
  watch: ['graphql/schema/*'],
  generates: {
    './types/graphql.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        useIndexSignature: true,
        contextType: './context#ContextT',
        enumsAsTypes: true,
      },
    },
  },
};

export default config;
