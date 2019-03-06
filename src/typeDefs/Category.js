import { gql } from 'apollo-server';

const Category = gql`
  type Category {
    id: ID! @unique
    categoryname: String
    rating: Int
  }
  
  extend type Query {
    filteredCategory(value: String): [Category]
  }
`;

export default Category;