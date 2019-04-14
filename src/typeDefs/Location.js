import { gql } from 'apollo-server';

const Location = gql`
  interface ILocatable {
    id: ID! @unique
    name: String
    location: Location
  }
  enum LocationType {
    Point
  }
  enum CategoryType {
    User
    Team
    Work
    Event
    Business
  }
  input GeoJsonInput {
    type: LocationType
    coordinates: [Float]
  }
  type GeoJson {
    type: LocationType
    coordinates: [Float]
  }
  type Location {
    id: ID! @unique
    holder: ILocatable
    geolocation: GeoJson
    category: CategoryType
    name: String
  }
  
  extend type Query {
    markers(geolocation: GeoJsonInput, categories: [String]): [Location]
  }
  
  extend type Mutation {
    getLocation(id: ID, geolocation: GeoJsonInput, category: String, name: String): ILocatable
    updateUserLocation(geolocation: GeoJsonInput, category: String, name: String): User
  }
`;

export default Location;