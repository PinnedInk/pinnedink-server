import { gql } from 'apollo-server';

const Job = gql`
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
  
  extend type Query {
    jobs(od: Int = 0, num:Int = 100, authorId: ID, inkname: String): [Job]
  }
  
  extend type Mutation {
    addJob(title: String!, description: String, company: String, email: String, location: String, url: String, name: String): Job
  }
`;

export default Job;