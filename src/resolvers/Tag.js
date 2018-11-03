import { Tag, User, Team, Work } from '../models';

export default {
  Query: {
    tags: async(_, { target }) => {
      if (target) {
        const user = await User.findOne({ inkname: target });
        if (user) {
          return user.tags;
        } else {
          const team = await Team.findOne({ inkname: target });
          if (team) {
            return team.tags;
          }
          else {
            const work = await Work.findOne({ name: target });
            if (work) {
              return work.tags;
            }
          }
        }
      }
      return Tag.find({});
    },
    filteredTags: async(_, { value }) => {
      return await Tag.find({"tagname": {$regex: '^'+ value, $options: 'i'}});
    }
  }
};