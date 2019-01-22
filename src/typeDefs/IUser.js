import { gql } from 'apollo-server';

const IUser = gql`
   interface IUser {
    id: ID! @unique
    inkname: String @unique
    name: String
    thumbUrl: String
    avatarUrl: String
    description: Description
    followers: [ISender]
    works: [Work]
    tags: [String]
    dialogues: [Dialogue]
  }
`;

export default IUser;