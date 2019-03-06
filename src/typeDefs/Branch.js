import { gql } from 'apollo-server';

const Branch = gql`
  input WorkingHoursInput {
    begin : Date
    end : Date
  }

  type WorkingHours {
    begin : Date
    end : Date
  }

  type Branch {
    id: ID! @unique
    author: IUserV
    authorId: ID
    branchName: String
    categories: [String]
    country: String
    postcode: String
    branchPhone: String
    siteUrl: String
    avatarUrl: String
    date: WorkingHours
    location: Location
  }

  #  extend type Query {
  #    events: [Event]
  #  }

  extend type Mutation {
    addBranch(authorId: ID, branchName: String, branchPhone: String, categories: [String], country: String, postcode: String, siteUrl: String, avatarUrl: String, date: WorkingHoursInput): Branch
  }
`;

export default Branch;