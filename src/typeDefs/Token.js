import { gql } from 'apollo-server';

const Token = gql`
  type Token {
    key: String @unique
    date: Date
    owner: ISender @unique
  }
  
  extend type Query {
    verifyEmailToken(token: String!, email: String!): Boolean
  }
`;

export default Token;