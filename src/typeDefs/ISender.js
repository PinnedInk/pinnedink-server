import { gql } from 'apollo-server';

const ISender = gql`
  interface ISender {
    id: ID! @unique
    inkname: String @unique
    name: String
    thumbUrl: String
    avatarUrl: String
    email: String
    effects: [Effect]
  }
`;

export default ISender;