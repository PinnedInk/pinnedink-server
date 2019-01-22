import { gql } from 'apollo-server';

const Team = gql`
  type Team implements IUser & ISender & ILocatable {
    id: ID! @unique
    thumbUrl: String
    description: Description
    members: [ISender]
    owner: User
    works: [Work]
    name: String
    inkname: String @unique
    followers: [ISender]
    messages: [Message]
    email: String
    avatarUrl: String
    tags: [String]
    effects: [Effect]
    dialogues: [Dialogue]
    location: Location
  }
  
  extend type Query {
    team(inkname: String): Team
    teams: [Team]
  }
  
  extend type Mutation {
    createTeam(inkname: String!, name: String, description: DesriptionInput, email: String, avatarUrl: String, members: [String], text: String, tags: [String]): Team
    updateTeam(inkname:String, description: DesriptionInput): Team
    inviteToTeam(inkname: String!, member: String): Team
    leaveTeam(inkname: String!): User
    removeTeam(id: ID!): User
  }
`;

export default Team;