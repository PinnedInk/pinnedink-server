import { Master, Branch } from '../models';

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
      certificates,
      branchId
    }, { business }) => {
      const branch = await Branch.findById(branchId);
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
      if (branch.masterIds) {
        branch.masterIds.push(master.id);
      } else {
        branch.masterIds = [master.id];
      }
      await branch.save();
      return master;
    },
  }
};