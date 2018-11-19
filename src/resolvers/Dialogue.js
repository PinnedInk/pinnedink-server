import { User, Message, Team, Dialogue } from '../models';

export default {
  Query: {
    // dialogue:(_, { id }) => Dialogue.findById(id),
  },
  Mutation: {
    createDialogue: async(err, { receivers, text }, { user }) => {
      let users = await User.getByInkname(receivers);
      const dialogue = await Dialogue.create({
        authorId: user.id,
        members: [],
        messages: [],
        date: Date.now()
      });
      
      users.map( async user => {
        await dialogue.updateOne(
          { $addToSet: { members: user.id } },
          { new: true }
        );
      });
      await User.bulkWrite(receivers.map((member => ({
        updateOne: {
          filter: { inkname: member },
          update: { $addToSet: { dialogueIds: dialogue.id } },
          upsert: true
        }
      }))));
      await user.dialogueIds.push(dialogue.id);
      await user.save();
      
      const message = await Message.create({
        type: 'Message',
        authorId: user.id,
        text,
        date: Date.now(),
        targetId: dialogue.id
      });
      await dialogue.messages.push(message._id);
      await dialogue.members.push(user.id);
      await dialogue.save();
      return dialogue;
    }
  }
};
