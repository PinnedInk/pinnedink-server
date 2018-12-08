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
        if (!user) {
          return null;
        }
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
    deleteDialogue: async(err, { id: dialogueId, authorId }, { user }) => {
      const dialogue = await Dialogue.findOne({ _id: dialogueId });
      if (authorId === user.id) {
        if (dialogue.membersIds.length) {
          await User.bulkWrite(dialogue.membersIds.map((id => ({
            updateOne: {
              filter: { '_id': id },
              update: { $pull: { dialogueIds: dialogue.id } },
              new: true
            }
          }))));
        }
        let userPos = user.dialogueIds.indexOf(dialogueId);
        user.dialogueIds.splice(userPos, 1);
        await user.save();
        await dialogue.remove();
        return user;
      }
      let userPos = user.dialogueIds.indexOf(dialogueId);
      let dialoguePos = dialogue.membersIds.indexOf(user.id);
      user.dialogueIds.splice(userPos, 1);
      dialogue.membersIds.splice(dialoguePos, 1);
      
      await dialogue.save();
      await user.save();
      return user;
    },
    openDialogue: async(err, { id: targetId }, { user }) => {
      const isMember = await Dialogue.find({
        'membersIds': [user.id],
        'authorId': targetId
      });
      const isAuthor = await Dialogue.find({
        'membersIds': [targetId],
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
        membersIds: targetId ? [targetId] : [],
        messagesIds: [],
        date: Date.now()
      });
      
      const isUserDialogue = await User.findOneAndUpdate(
        { _id: targetId },
        { $addToSet: { dialogueIds: dialogue.id } },
        { new: true }
      );
      if (!isUserDialogue && targetId) {
        await Team.findOneAndUpdate(
          { _id: targetId },
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