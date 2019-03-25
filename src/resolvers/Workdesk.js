import { Workdesk, Branch } from '../models';

export default {
  Query: {
    workdesks: async(_, { authorId }) => {
      return await Workdesk.find({ authorId });
    }
  },
  Mutation: {
    addWorkdesk: async(_, { title, avatarUrl, description, service, workHours, rental, branchId }, { business }) => {
      const branch = await Branch.findById(branchId);
      const workdesk = await Workdesk.create({
        authorId: business.id, title, avatarUrl, description, serviceId: service, workHours, rental
      });
      if (branch.workdeskIds) {
        branch.workdeskIds.push(workdesk.id);
      } else {
        branch.workdeskIds = [workdesk.id];
      }
      await branch.save();
      return workdesk;
    },
  }
};