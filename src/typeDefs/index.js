import { gql } from 'apollo-server';

export default gql`
  scalar Date

  interface ISender {
    id: ID! @unique
    inkname: String @unique
    name: String
    thumbUrl: String
    avatarUrl: String
    email: String
    effects: [Effect]
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
    dialogues: [Dialogue]
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

  type Work implements IResponsable & ILocatable {
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
    location: Location
  }

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

  type Tag {
    id: ID! @unique
    tagname: String
    rating: Int
  }

  interface IEffect {
    date: Date
    type: EffectType
  }

  enum EffectType {
    Pro
  }

  type Effect {
    date: Date
    type: EffectType
  }

  type Dialogue {
    id: ID! @unique
    date: Date
    author: ISender
    members: [User]
    messages: [Message]
  }

  type Subscription {
    messageAdded(dialogueId: ID!): Message
    messageDeleted(dialogueId: ID!): Message
    userUpdated(dialogueId: ID!): User
  }

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
    dialogues: [Dialogue]
    dialogue(id: ID): Dialogue
    markers(geolocation: GeoJsonInput, category: [String]): [Location]
  }

  type Mutation {
    follow(inkname: String): User
    logout: User
    login(email: String!, password: String!): User
    like(targetId: ID!, authorId: ID!): IResponsable
    createTeam(inkname: String!, name: String, description: DesriptionInput, email: String, avatarUrl: String, members: [String], text: String, tags: [String]): Team
    updateTeam(inkname:String, description: DesriptionInput): Team
    inviteToTeam(inkname: String!, member: String): Team
    leaveTeam(inkname: String!): User
    removeTeam(id: ID!): User
    applyInvite(inkname: String, messageId: ID!): User
    removeMessage(id: ID!): Dialogue
    createMessage(receivers: [String!], text: String!): User
    addComment(target: ID!, author: ID!, text: String!): IResponsable
    createUser(email: String!, password: String!): User
    removeUser(id: ID!): User
    toggleEffect(type: String!): User
    updateUser(name: String, inkname:String, description: DesriptionInput, avatarUrl: String, email: String, password: String, thumbUrl: String, tags: [String]): User
    addWork(url: String!, thumbUrl: String!, name: String!, description: String!, tags: [String]): User
    updateWork(id: ID, description: String, name: String, tags:[String]): Work
    removeWork(id: ID!): Work
    archiveWork(id: ID): Work
    view(id: ID!): Work
    addJob(title: String!, description: String, company: String, email: String, location: String, url: String, name: String): Job
    addEvent(name: String!, description: String!, date: EventDateInput!, authorId: String, place: EventPlaceInput!): Event
    validateUserName(inkname:String): User
    sendVerifyEmail(email:String!): Boolean
    openDialogue(id: ID): Dialogue
    updateDialogueUsers(dialogueId: ID!, receiver:String): Dialogue
    deleteDialogue(id: ID!, authorId: ID! ): User
    addDialogMessage(dialogueId: ID, text: String): Message
    getLocation(id: ID, geolocation: GeoJsonInput, category: String): ILocatable
    updateUserLocation(geolocation: GeoJsonInput, category: String): User
  }
`;