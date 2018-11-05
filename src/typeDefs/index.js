import { gql } from 'apollo-server';

export default gql`
  scalar Date

  interface ISender {
    id: ID! @unique
    inkname: String @unique
    email: String
    name: String
    thumbUrl: String
    avatarUrl: String
  }

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
  }

  interface IResponsable {
    id: ID! @unique
    author: ISender
    date: Date
    target: IResponsable
  }

  type Description {
    bio: String
    site: String
    location: String
  }

  input DesriptionInput {
    bio: String
    site: String
    location: String
  }

  type Token {
    key: String @unique
    date: Date
    owner: ISender @unique
  }

  type User implements ISender & IUser {
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
  }

  type Like implements IResponsable {
    id: ID! @unique
    author: ISender
    date: Date
    target: IResponsable
  }

  type Comment implements IResponsable {
    id: ID! @unique
    author: ISender
    text: String
    likes: [Like]
    date: Date
    target: IResponsable
  }

  enum MessageType {
    Invite
    Message
  }

  type Message implements IResponsable {
    type: MessageType
    id: ID! @unique
    author: ISender
    text: String
    date: Date
    target: IResponsable
  }

  type Job implements IResponsable {
    id: ID! @unique
    author: ISender
    date: Date
    title: String
    target: IResponsable
    company: String
    url: String
    name: String
    email: String
    description: String
    location: String
  }

  type Team implements ISender & IUser {
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
  }

  type Work implements IResponsable {
    id: ID! @unique
    likes: [Like]
    description: String
    author: ISender
    comments: [Comment]
    date: Date
    name: String
    thumbUrl: String
    url: String
    view: Int
    target: IResponsable
    tags: [String]
    archived: [User]
  }

  input SessionLocationInput {
    lat: Float
    lng: Float
  }

  type SessionLocation {
    lat: Float
    lng: Float
  }

  input SessionPlaceInput {
    address: String
    id: String
    location: SessionLocationInput
  }

  type SessionPlace {
    address: String
    id: String
    location: SessionLocation
  }

  input SessionDateInput {
    begin : Date
    end : Date
  }

  type SessionDate {
    begin : Date
    end : Date
  }

  type Event {
    id: ID! @unique
    title: String
    description: String
    author: ISender
    date: SessionDate
    authorId: String
    place: SessionPlace
  }

  type Tag {
    id: ID! @unique
    tagname: String
    rating: Int
  }

  type Query {
    verifyEmailToken(token: String!, email: String!): Boolean
    verify(provider: String!, code: String!): User
    works(od: Int = 0, num:Int = 100, authorId: ID, inkname: String): [Work]
    archivedWorks(od: Int = 0, num:Int = 100, inkname: String): [Work]
    work(id: ID!): Work
    worksByUserId(id: ID!): [Work]
    comments(ids: [String]): [Comment]
    user(inkname: String, email: String): IUser
    users: [User]
    currentUser: User
    team(inkname: String): Team
    teams: [Team]
    message(id: ID): Message
    messages: [Message]
    jobs(od: Int = 0, num:Int = 100, authorId: ID, inkname: String): [Job]
    events: [Event]
    tags(target: String!): [String]
    filteredTags(value: String): [Tag]
    filteredUsers(value: String): [User]
  }

  type Mutation {
    follow(inkname: String): User
    logout: User
    login(email: String!, password: String!): User
    like(targetId: ID!, authorId: ID!): IResponsable
    createTeam(inkname: String!, description: DesriptionInput, email: String, avatarUrl: String, members: [String], text: String, tags: [String]): Team
    updateTeam(inkname:String, description: DesriptionInput): Team
    inviteToTeam(inkname: String!, member: String): Team
    applyInvite(inkname: String): User
    removeMessage(id: ID!): User
    createMessage(receivers: [String!], text: String!): User
    addComment(target: ID!, author: ID!, text: String!): IResponsable
    createUser(email: String!, password: String!): User
    removeUser(id: ID!): User
    updateUser(name: String, inkname:String, description: DesriptionInput, avatarUrl:String, email: String, password: String, thumbUrl: String, tags: [String]): User
    addWork(url: String!, thumbUrl: String!, name: String!, description: String!, tags: [String]): User
    updateWork(id: ID, description: String, name: String, tags:[String]): Work
    removeWork(id: ID!): Work
    archiveWork(id: ID): Work
    view(id: ID!): Work
    addJob(title: String!, description: String, company: String, email: String, location: String, url: String, name: String): Job
    addEvent(title: String!, description: String!, date: SessionDateInput!, authorId: String, place: SessionPlaceInput!): Event
    validateUserName(inkname:String): User
    sendVerifyEmail(email:String!): Boolean
  }
`;