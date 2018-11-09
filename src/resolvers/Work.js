import { Work, User, Team } from '../models';
import { removeIds, createTag } from '../utils';
import moment from 'moment';
import _ from 'lodash';

export default {
  Query: {
    works: async(_, { od, num, authorId, inkname }) => {
      if (authorId) {
        return Work.find({ authorId });
      }
      if (inkname) {
        const user = await User.findOne({ inkname });
        if (user) {
          return user.works;
        } else {
          const team = await Team.findOne({ inkname });
          if (team) {
            return team.works;
          }
        }
      }
      return Work.find().exists('authorId');
    },
    work: (_, { id }) => Work.findById(id),
    worksByUserId: (_, { authorId }) => Work.find({
      authorId
    }),
    archivedWorks: async(_, { inkname }) => {
      if (inkname) {
        const user = await User.findOne({ inkname });
        if (user) {
          return user.archivedWorks;
        }
      }
      return null;
    },
  },
  Mutation: {
    addWork: async(__, { url, thumbUrl, name, description, tags }, { user }) => {
      const isPro = _.find(user.effects, { type: 'Pro' });
      const worksCount = await Work.aggregate(
        [{
          $match: {
            date: {
              $gte: new Date(moment().startOf('month').utc().toISOString()),
              $lt: new Date(moment().endOf('month').utc().toISOString())
            }
          }
        }]
      );
      const work = await Work.create({
        url,
        thumbUrl,
        authorId: user.id,
        name,
        view: 0,
        description,
        date: Date.now()
      });
      if (tags && tags.length) {
        await createTag(tags, work);
      }
      user.worksIds.push(work.id);
      await user.save();
      return user;
    },
    updateWork: async(_, { id, description, name, tags }) => {
      const work = await Work.findOneAndUpdate({ _id: id }, {
        description,
        name
      }, { new: true });
      if (tags) {
        await createTag(tags, work);
      }
      return work;
    },
    removeWork: async(_, { id: workId }, { user }) => {
      await Work.findByIdAndRemove(workId);
      await removeIds(user, workId, 'worksIds');
      await user.save();
      return user;
    },
    view: async(_, { id }, { token }) => {
      if (token) {
        const tokenViewdId = token.views.find(_id => _id == id);
        if (!tokenViewdId) {
          token.views.push(id);
          await token.save();
          return Work.findByIdAndUpdate(id, { $inc: { 'view': 1 } }, { new: true });
        }
      }
      return Work.findById(id);
    },
    archiveWork: async(_, { id }, { user }) => {
      const work = await Work.findOneAndUpdate(
        { _id: id },
        { $addToSet: { archivedUsersIds: user.id } },
        { new: true }
      );
      await user.updateOne(
        { $addToSet: { archivedWorksIds: work.id } },
        { new: true }
      );
      return work;
    },
  }
};