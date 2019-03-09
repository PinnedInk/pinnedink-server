import { Workdesk } from '../models';

export default {
  Mutation: {
    addWorkdesk: async(_, { title, avatarUrl, description, service, workHours, rental }, { business }) => {
      const workdesk = await Workdesk.create({
        authorId: business.id ,title, avatarUrl, description, serviceId: service, workHours, rental
      });
      if (business.workdeskIds) {
        business.workdeskIds.push(workdesk.id);
      } else {
        business.workdeskIds = [workdesk.id];
      }
      await business.save();
      return workdesk;
    },
  }
};