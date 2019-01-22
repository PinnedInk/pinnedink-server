import { gql } from 'apollo-server';

const Event = gql`
  input EventPlaceInput {
    address: String
    id: String
  }

  type EventPlace {
    address: String
    id: String
  }

  input EventDateInput {
    begin : Date
    end : Date
  }

  type EventDate {
    begin : Date
    end : Date
  }

  type Event implements ILocatable {
    id: ID! @unique
    description: String
    author: ISender
    date: EventDate
    authorId: String
    place: EventPlace
    location: Location
    name: String
  }
  
  extend type Query {
    events: [Event]
  }
  
  extend type Mutation {
    addEvent(name: String!, description: String!, date: EventDateInput!, authorId: String, place: EventPlaceInput!): Event
  }
`;

export default Event;