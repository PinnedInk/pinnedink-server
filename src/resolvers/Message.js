import { User, Message, Team } from '../models';
import { addingToIds, removeIds } from '../utils';

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
  }
};
