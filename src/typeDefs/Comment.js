import { gql } from 'apollo-server';

const Comment = gql`
  type Comment implements IResponsable {
    id: ID! @unique
    author: ISender
    text: String
    likes: [Like]
    date: Date
    target: IResponsable
  }
  extend type Query {
    comments(ids: [String]): [Comment]
  }

  extend type Mutation {
    addComment(target: ID!, author: ID!, text: String!): IResponsable
  }
`;

export default Comment;