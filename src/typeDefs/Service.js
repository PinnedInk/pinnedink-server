import { gql } from 'apollo-server';

const Service = gql`
  type Service {
    id: ID! @unique
    author:IUserV
    name: String
    categories: [Category]
    subcategories: [Subcategory]
    duration: String
    cost: String
  }

  extend type Mutation {
    addService(name: String, categories: [String], subcategories: [String], duration: String, cost: String): Service
  }
`;

export default Service;