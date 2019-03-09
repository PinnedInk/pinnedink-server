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
    services:[Service]
    workdesks:[Workdesk]
    masters:[Master]
  }

  extend type Query {
    user(id: ID!, email: String): IUserV
    currentUser: IUserV
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