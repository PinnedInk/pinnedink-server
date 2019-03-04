import { gql } from 'apollo-server';

const Business = gql`
  type Business implements IUserV {
    id: ID! @unique
    token: Token
    companyName: String
    name: String
    email: String @unique
    password: String
    phoneNumber: String
    thumbUrl: String
    avatarUrl: String
  }

  extend type Query {
    user(id: String, email: String): IUserV
    #    users: [User]
    currentUser: IUserV
    #    filteredUsers(value: String): [User]
    verify(provider: String!, code: String!): IUserV
  }

  extend type Mutation {
    logout: IUserV
    login(email: String!, password: String!): IUserV
    addNewBusiness(companyName: String, name:String!, phoneNumber:String!, email:String!, password: String!): IUserV
    sendVerifyEmail(email:String!): Boolean
  }
`;

export default Business;


// extend type Query {
// #    user(inkname: String, email: String): IUser
// }
//
// extend type Mutation {
// #    logout: User
// #    login(email: String!, password: String!): User
//   addNewBusiness(email: String!, password: String!): IUserV
// }


// type Business implements IUserV {
//   id: ID! @unique
//   token: Token
//   companyName: String
//   name: String
//   email: String @unique
//   password: String
//   phoneNumber: String
//   thumbUrl: String
//   avatarUrl: String
//   branchName: String
//   category: String
//   country: String
//   postcode: String
//   branchPhone: String
//   siteUrl: String
//   workihgHours: WorkingHours
//   location: Location
// }