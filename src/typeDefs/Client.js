import { gql } from 'apollo-server';

const Client = gql`
  type Client {
    id: ID! @unique
    owner: IUserV
    phone: String,
    email: String,
    name: String,
    surname: String,
    city: String,
    avatarUrl: String,
    thumbUrl: String,
    birthDate: Date,
    sex: String,
    type: String
  }

  extend type Mutation {
    addClient(
      phone: String,
      email: String,
      name: String,
      surname: String,
      city: String,
      avatarUrl: String,
      birthDate: Date,
      sex: String,
      type: String,
      branchId: ID
    ): Client
  }
`;

export default Client;