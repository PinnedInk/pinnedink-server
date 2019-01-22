import { gql } from 'apollo-server';

const Message = gql`
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
  
  extend type Query {
    message(id: ID): Message
    messages: [Message]
  }
  
  extend type Mutation {
    removeMessage(id: ID!): Dialogue
    createMessage(receivers: [String!], text: String!): User
  }

  extend type Subscription {
    messageAdded(dialogueId: ID!): Message
    messageDeleted(dialogueId: ID!): Message
  }
`;

export default Message;