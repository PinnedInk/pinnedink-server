import { gql } from 'apollo-server';

const Work = gql`
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
  
  extend type Query {
    works(od: Int = 0, num:Int = 100, authorId: ID, inkname: String): [Work]
    archivedWorks(od: Int = 0, num:Int = 100, inkname: String): [Work]
    work(id: ID!): Work
    worksByUserId(id: ID!): [Work]
  }
  
  extend type Mutation {
    addWork(url: String!, thumbUrl: String!, name: String!, description: String!, tags: [String]): User
    updateWork(id: ID, description: String, name: String, tags:[String]): Work
    removeWork(id: ID!): Work
    archiveWork(id: ID): Work
    view(id: ID!): Work
  }
`;

export default Work;