import { gql } from 'apollo-server';

const IUserV = gql`
  interface IUserV {
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
`;

export default IUserV;