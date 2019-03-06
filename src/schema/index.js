import { gql } from 'apollo-server';
import { makeExecutableSchema } from 'apollo-server-express';
import resolvers from '../resolvers';
import typeDefs from '../typeDefs';

const baseSchema = gql`
  scalar Date
  type Query {
    domain: String
  }
  type Mutation {
    domain: String
  }
  type Subscription {
    domain: String
  }
`;

const schema = [baseSchema, ...typeDefs];

const options = {
  typeDefs: schema,
  resolvers
};

export default makeExecutableSchema(options);