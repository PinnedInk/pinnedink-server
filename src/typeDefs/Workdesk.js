import { gql } from 'apollo-server';

const Workdesk = gql`
  type Workdesk {
    id: ID! @unique
    author: IUserV
    title: String
    thumbUrl: String
    avatarUrl: String
    description: String
    service: Service
    workHours: WorkingHours
    rental: String
  }
  extend type Query {
    workdesks(authorId: ID): [Workdesk]
  }
  extend type Mutation {
    addWorkdesk(title: String, avatarUrl: String, description: String, service: ID!, workHours: WorkingHoursInput, rental: String): Workdesk
  }
`;

export default Workdesk;