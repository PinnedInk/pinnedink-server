import { User, Message, Team, Dialogue } from '../models';

export default {
  Query: {
    // dialogue: (_, { id }) => Dialogue.findById(id),
  },
  Mutation: {
    createDialogue: async(err, { receivers, text }, { user: { id } }) => {
      let users = await User.getByInkname(receivers);
      const dialogue = await Dialogue.create({
        authorId: id,
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
      
      const message = await Message.create({
        type: 'Message',
        authorId: id,
        text,
        date: Date.now(),
        targetId: dialogue.id
      });
      await dialogue.messages.push(message._id);
      await dialogue.save();
      return dialogue;
    }
  }
};
