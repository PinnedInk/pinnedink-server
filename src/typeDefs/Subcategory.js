import { gql } from 'apollo-server';

const Subcategory = gql`
  type Subcategory {
    id: ID! @unique
    subcategoryname: String
    rating: Int
  }
  
  extend type Query {
    filteredSubcategory(value: String): [Subcategory]
  }
`;

export default Subcategory;