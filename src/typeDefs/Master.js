import { gql } from 'apollo-server';

const Master = gql`
  type Master {
    id: ID! @unique
    owner: IUserV
    email: String,
    name: String,
    surname: String,
    avatarUrl: String,
    thumbUrl: String,
    service: [Service],
    birthDate: Date,
    workHours: WorkingHours,
    phone: String,
    description: String,
    certificates: [String]
  }

  extend type Mutation {
    addMaster(
      email: String,
      name: String,
      surname: String,
      avatarUrl: String,
      thumbUrl: String,
      serviceIds: [ID],
      birthDate: Date,
      workHours: WorkingHoursInput,
      phone: String,
      description: String,
      certificates: [String]
    ): Master
  }
`;

export default Master;