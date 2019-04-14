import { gql } from 'apollo-server';

const User = gql`
 type User implements ISender & IUser & ILocatable {
    id: ID! @unique
    email: String @unique
    token: Token
    password: String
    followers: [ISender]
    following: [ISender]
    name: String
    inkname: String @unique
    thumbUrl: String
    avatarUrl: String
    works: [Work]
    description: Description
    messages: [Message]
    team: Team
    jobs: [Job]
    events: [Event]
    likes: [Like]
    members: [ISender]
    tags: [String]
    archivedWorks: [Work]
    effects: [Effect]
    dialogues: [Dialogue]
    location: Location
  }
  
#  extend type Query {
#    user(inkname: String, email: String): IUser
#    users: [User]
#    currentUser: User
#    filteredUsers(value: String): [User]
#    verify(provider: String!, code: String!): User
#  }
#
#  extend type Mutation {
#    follow(inkname: String): User
#    logout: User
#    login(email: String!, password: String!): User
#    createUser(email: String!, password: String!): User
#    removeUser(id: ID!): User
#    updateUser(name: String, inkname:String, description: DesriptionInput, avatarUrl: String, email: String, password: String, thumbUrl: String, tags: [String]): User
#    validateUserName(inkname:String): User
#    applyInvite(inkname: String, messageId: ID!): User
#    sendVerifyEmail(email:String!): Boolean
#  }
#
   extend type Subscription {
     userUpdated(dialogueId: ID!): User
   }
`;

export default User;