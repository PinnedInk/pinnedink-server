import { User, Dialogue, Team } from '../models';
import { PubSub, withFilter } from 'graphql-subscriptions';

const pubsub = new PubSub();

const UPDATED_DIALOGUE_USER = 'updated_dialogue_user';

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
    updateDialogueUsers: async(err, { dialogueId, receiver }) => {
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
        await pubsub.publish(UPDATED_DIALOGUE_USER, { userUpdated: user, dialogueId });
        return dialogue;
      }
      
      return null;
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
      
      const isMember = await Dialogue.find({
        'membersIds': [user.id],
        'authorId': id
      });
      const isAuthor = await Dialogue.find({
        'membersIds': [id],
        'authorId': user.id
      });
      
      if (isMember.length || isAuthor.length) {
        if (isMember.length) {
          return isMember[0];
        }
        return isAuthor[0];
      }
      
      const dialogue = await Dialogue.create({
        authorId: user.id,
        membersIds: [id],
        messagesIds: [],
        date: Date.now()
      });
      
      const isUpdatedUser = await User.findOneAndUpdate(
        { _id: id },
        { $addToSet: { dialogueIds: dialogue.id } },
        { new: true }
      );
      if (!isUpdatedUser) {
        await Team.findOneAndUpdate(
          { _id: id },
          { $addToSet: { dialogueIds: dialogue.id } },
          { new: true, upsert: true }
        );
      }
      
      user.dialogueIds.push(dialogue.id);
      await user.save();
      
      return dialogue;
    }
  },
  Subscription: {
    userUpdated: {
      subscribe: withFilter(() => pubsub.asyncIterator([UPDATED_DIALOGUE_USER]), (payload, variables) => {
        return payload.dialogueId === variables.dialogueId;
      }),
    }
  }
};