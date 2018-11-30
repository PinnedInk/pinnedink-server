import { Team, Message, User } from '../models';
import { addingToIds, createTag } from '../utils';

// TODO исправить sendInvite - на createMessage from Message model

const sendInvites = async (inkname, members, text) => {
  const team = await Team.findOne({ inkname });
  //members
  //const users = await User.updateMany({ inkname: { $in: members } })
  const users = await User.find({ inkname: { $in: members }});
  const usersId = users.map(u => u.id);
  const messages = await Message.updateMany({
    targetId: { $in: usersId },
    type: 'Invite',
    authorId: team.id
  }, {     
    text,
    date: Date.now() 
  }, { upsert: true, new: true });
  //console.log('messages', messages);
  const messagesIds = messages.upserted.map(m => m._id);
  
  await Team.updateOne({ inkname }, { $push: { messagesIds } });
  await User.bulkWrite(users.map(((user, i) => ({
    updateOne: {
      filter: { _id: user.id },
      update: { $push: { messagesIds: messagesIds[i] } }
    }
  }))));
};

export default {
  Query: {
    team: (_, { inkname }) => Team.getByName(inkname),
    teams: (_, { ids }) => Team.getList(ids),
  },
  Mutation: {
    createTeam: async(_, { inkname, description, email, members, avatarUrl, text, tags, name }, { user }) => {
      let thumbUrl;
      if (avatarUrl) {
        thumbUrl = `avatar/thumbnail/${avatarUrl}`;
        avatarUrl = `avatar/${avatarUrl}`;
      }
      const team = await Team.findOneAndUpdate({
        inkname
      }, {
        tags,
        name,
        description,
        ownerId: user.id,
        email,
        thumbUrl,
        avatarUrl
      }, { upsert: true, new: true });
      if (members && members.length > 0) {
        await sendInvites(inkname, members, text);
      }
      if (tags) {
        await createTag(tags, team);
      }
      user.teamId = team.id;
      await user.save();
      return team;
    },
    
    updateTeam: async(_, { inkname, description }, { user }) => {},
    
    inviteToTeam: async(_, { inkname, member }) => await sendInvites(inkname, [member]),
  }
};