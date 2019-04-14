import { gql } from 'apollo-server';

const Branch = gql`
  type Branch {
    id: ID! @unique
    author: IUserV
    authorId: ID
    branchName: String
    country: String
    postcode: String
    branchPhone: String
    siteUrl: String
    avatarUrl: String
    workHours: WorkingHours
    location: Location
    categories: [Category]
    services:[Service]
    workdesks:[Workdesk]
    masters:[Master]
    clients: [Client]
  }

  extend type Mutation {
    addBranch(authorId: ID, branchName: String, branchPhone: String, categories: [String], country: String, postcode: String, siteUrl: String, avatarUrl: String, workHours: WorkingHoursInput): Branch
  }
`;

export default Branch;