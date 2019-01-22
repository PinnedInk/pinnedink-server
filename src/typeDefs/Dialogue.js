import { gql } from 'apollo-server';

const Dialogue = gql`
  type Dialogue {
    id: ID! @unique
    date: Date
    author: ISender
    members: [User]
    messages: [Message]
  }
  
  extend type Query {
    dialogues: [Dialogue]
    dialogue(id: ID): Dialogue
  }
  
  extend type Mutation {
    openDialogue(id: ID): Dialogue
    updateDialogueUsers(dialogueId: ID!, receiver:String): Dialogue
    deleteDialogue(id: ID!, authorId: ID! ): User
    addDialogMessage(dialogueId: ID, text: String): Message
  }
`;

export default Dialogue;