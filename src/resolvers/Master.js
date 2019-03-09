import { Master } from '../models';

export default {
  Mutation: {
    addMaster: async(_, {
      email,
      name,
      surname,
      avatarUrl,
      serviceIds,
      birthDate,
      workHours,
      phone,
      description,
      certificates
    }, { business }) => {
      const master = await Master.create({
        ownerId: business.id,
        email,
        name,
        surname,
        avatarUrl,
        serviceIds,
        birthDate,
        workHours,
        phone,
        description,
        certificates
      });
      if (business.masterIds) {
        business.masterIds.push(master.id);
      } else {
        business.masterIds = [master.id];
      }
      await business.save();
      return master;
    },
  }
};