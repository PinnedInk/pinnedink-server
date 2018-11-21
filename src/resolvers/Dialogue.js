import { User, Message, Team, Dialogue } from '../models';

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
    updateDialogue: async(err, { text, dialogueId, receiver }, { user }) => {
      if (receiver) {
        let dialog;
        let user = await User.findOne({ 'inkname': receiver });
        let targetId = user.dialogueIds.indexOf(dialogueId);
        
        if (targetId !== -1) {
          dialog = await Dialogue.findOneAndUpdate(
            { _id: dialogueId },
            { $pull: { membersIds: user.id } },
            { new: true }
          );
          user.dialogueIds.splice(targetId, 1);
        } else {
          dialog = await Dialogue.findOneAndUpdate(
            { _id: dialogueId },
            { $addToSet: { membersIds: user.id } },
            { new: true }
          );
          user.dialogueIds.push(dialogueId);
        }
        await user.save();
        return dialog;
      }
      
      const message = await Message.create({
        type: 'Message',
        authorId: user.id,
        text,
        date: Date.now(),
        targetId: dialogueId
      });
      
      return await Dialogue.findOneAndUpdate(
        { _id: dialogueId },
        { $push: { messagesIds: message.id } },
        { new: true }
      );
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
      
      return await Dialogue.create({
        authorId: user.id,
        membersIds: members,
        messagesIds: [],
        date: Date.now()
      });
    }
  }
};