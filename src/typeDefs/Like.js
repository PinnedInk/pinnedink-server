import { gql } from 'apollo-server';

const Like = gql`
  type Like implements IResponsable {
    id: ID! @unique
    author: ISender
    date: Date
    target: IResponsable
  }
  
  extend type Mutation {
    like(targetId: ID!, authorId: ID!): IResponsable
  }
`;

export default Like;