import { gql } from 'apollo-server';

const Business = gql`
 
  type Business implements {
    id: ID! @unique
    token: Token
    companyName: String
    name: String
    email: String @unique
    password: String
    phoneNumber: String
    avatarUrl: String
    branchName: String
    category: String
    country: String
    postcode: String
    branchPhone: String
    siteUrl: String
    workihgHours: WorkingHours
    location: Location
  }

  extend type Query {
    user(inkname: String, email: String): IUser
  }
  
  extend type Mutation {
    logout: User
    login(email: String!, password: String!): User
    createUser(email: String!, password: String!): User
  }
`;

export default Business;