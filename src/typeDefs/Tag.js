import { gql } from 'apollo-server';

const Tag = gql`
  type Tag {
    id: ID! @unique
    tagname: String
    rating: Int
  }
  
  extend type Query {
    tags(target: String!): [String]
    filteredTags(value: String): [Tag]
  }
`;

export default Tag;