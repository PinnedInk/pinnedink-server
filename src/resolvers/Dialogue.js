import { User, Message, Dialogue } from '../models';
import { PubSub, withFilter } from 'graphql-subscriptions';

const pubsub = new PubSub();

const ADD_MESSAGE_TO_DIALOGUE = 'add_message_to_dialogue';

export default {
  Query: {
    dialogue: async(_, { id }) => {
      return await Dialogue.findById(id);
    },
    dialogues: async(_, {}, { user }) => {
      return await Dialogue.getList(user.dialogueIds);
    },
  },
  Mutation: {
    updateDialogue: async(err, { dialogueId, receiver }, { user }) => {
      if (receiver) {
        let dialogue;
        let user = await User.findOne({ 'inkname': receiver });
        let targetId = user.dialogueIds.indexOf(dialogueId);
        
        if (targetId !== -1) {
          dialogue = await Dialogue.findOneAndUpdate(
            { _id: dialogueId },
            { $pull: { membersIds: user.id } },
            { new: true }
          );
          user.dialogueIds.splice(targetId, 1);
        } else {
          dialogue = await Dialogue.findOneAndUpdate(
            { _id: dialogueId },
            { $addToSet: { membersIds: user.id } },
            { new: true }
          );
          user.dialogueIds.push(dialogueId);
        }
        await user.save();
        return dialogue;
      }
      
      return null;
    },
    addDialogMessage: async(err, { text, dialogueId }, { user }) => {
      
      const message = await Message.create({
        type: 'Message',
        authorId: user.id,
        text,
        date: Date.now(),
        targetId: dialogueId
      });
      
      const dialogue = await Dialogue.findOneAndUpdate(
        { _id: dialogueId },
        { $push: { messagesIds: message.id } },
        { new: true }
      );
      
      pubsub.publish(ADD_MESSAGE_TO_DIALOGUE, { messageAdded: message, dialogueId: dialogue.id });
      
      return dialogue;
    },
    
    deleteDialogue: async(err, { id, authorId }, { user }) => {
      const dialogue = await Dialogue.findOne({ _id: id });
      
      if (authorId === user.id) {
        await User.bulkWrite(dialogue.membersIds.map((id => ({
          updateOne: {
            filter: { '_id': id },
            update: { $pull: { dialogueIds: dialogue.id } },
            new: true
          }
        }))));
        await dialogue.remove();
        return user;
      }
      
      let userPos = user.dialogueIds.indexOf(id);
      let dialoguePos = dialogue.membersIds.indexOf(user.id);
      user.dialogueIds.splice(userPos, 1);
      dialogue.membersIds.splice(dialoguePos, 1);
      
      await dialogue.save();
      await user.save();
      return user;
    },
    
    openDialogue: async(err, { id }, { user }) => {
      const members = [id];
      members.push(user.id);
      
      const existDialog = await Dialogue.find({
        'membersIds': members
      });
      
      if (existDialog.length) {
        return existDialog[0];
      }
      
      const dialogue = await Dialogue.create({
        authorId: user.id,
        membersIds: members,
        messagesIds: [],
        date: Date.now()
      });
      
      await User.bulkWrite(members.map((id => ({
        updateOne: {
          filter: { '_id': id },
          update: { $addToSet: { dialogueIds: dialogue.id } },
          upsert: true
        }
      }))));
      
      
      return dialogue;
    }
  },
  Subscription: {
    messageAdded: {
      subscribe: () => pubsub.asyncIterator(ADD_MESSAGE_TO_DIALOGUE)
    }
  },
};