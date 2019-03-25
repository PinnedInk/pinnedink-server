import { Team, Message, User, Dialogue } from '../models';
import { addElemsToModel } from '../utils';

const sendInvites = async(inkname, members, text) => {
  const team = await Team.findOne({ inkname });
  const users = await User.find({ inkname: { $in: members } });
  const usersId = users.map(u => u.id);
  
  usersId.map(async userId => {
    const dialogue = await Dialogue.create({
      membersIds: [userId],
      authorId: team.id,
      date: Date.now(),
      messagesIds: []
    });
    const message = await Message.create({
      type: 'Invite',
      authorId: team.id,
      text: text || 'Join to our team',
      date: Date.now(),
      targetId: dialogue.id
    });
    
    dialogue.messagesIds.push(message.id);
    await dialogue.save();
    
    await Team.findOneAndUpdate(
      { inkname },
      { $push: { dialogueIds: dialogue.id } },
      { new: true }
    );
    
    await User.findOneAndUpdate(
      { _id: userId },
      { $addToSet: { dialogueIds: dialogue.id } },
      { new: true }
    );
  });
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
        await addElemsToModel(tags, team);
      }
      user.teamId = team.id;
      await user.save();
      return team;
    },
    
    updateTeam: async(_, { inkname, description }, { user }) => {},
    
    inviteToTeam: async(_, { inkname, member }) => await sendInvites(inkname, [member])
    
  }
};