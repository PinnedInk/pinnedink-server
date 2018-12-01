import { User, Message, Team, Dialogue } from '../models';
import { addingToIds, removeIds } from '../utils';
import { PubSub, withFilter } from 'graphql-subscriptions';

const pubsub = new PubSub();

const ADD_MESSAGE_TO_DIALOGUE = 'add_message_to_dialogue';

const sendMessage = async(id, member, text) => {
  const user = await User.findOne({ inkname: member });
  const message = await Message.create({
    type: 'Message',
    authorId: id,
    text,
    date: Date.now(),
    targetId: user.id
  });
  await addingToIds(user, message.id, 'messagesIds');
  await user.save();
  return message;
};

export default {
  Query: {
    message: (_, { id }) => Message.findById(id),
    messages: async(_, {}, { user }) => {
      return Message.getList(user.messagesIds);
    },
  },
  Mutation: {
    addDialogMessage: async(err, { text, dialogueId }, { user }) => {
      const message = await Message.create({
        type: 'Message',
        authorId: user.id,
        text,
        date: Date.now(),
        targetId: dialogueId
      });
    
      await Dialogue.findOneAndUpdate(
        { _id: dialogueId },
        { $push: { messagesIds: message.id } },
        { new: true }
      );
      await pubsub.publish(ADD_MESSAGE_TO_DIALOGUE, { messageAdded: message, dialogueId });
      return message;
    },
    createMessage: async(err, { receivers, text }, { user: { id } }) => {
      receivers.forEach((member) => sendMessage(id, member, text));
    },
    removeMessage: async(_, { id: messageId }, { user }) => {
      const message = await Message.findByIdAndRemove(messageId);
      if (message.type === 'Invite') {
        const team = await Team.findById(message.authorId);
        await removeIds(team, message.id, 'messagesIds');
        await team.save();
      }
      await removeIds(user, message.id, 'messagesIds');
      await user.save();
      return user;
    },
  },
  Subscription: {
    messageAdded: {
      subscribe: withFilter(() => pubsub.asyncIterator([ADD_MESSAGE_TO_DIALOGUE]), (payload, variables) => {
        return payload.dialogueId === variables.dialogueId;
      }),
    }
  }
};
