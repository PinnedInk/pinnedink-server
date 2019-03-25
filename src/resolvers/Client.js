import { Client, Branch } from '../models';

export default {
  Mutation: {
    addClient: async(_, {
      phone,
      email,
      name,
      surname,
      city,
      avatarUrl,
      birthDate,
      sex,
      type,
      branchId
    }, { business }) => {
      const branch = await Branch.findById(branchId);
      const client = await Client.create({
        ownerId: business.id,
        phone,
        email,
        name,
        surname,
        city,
        avatarUrl,
        birthDate,
        sex,
        type
      });
      if (branch.clientIds) {
        branch.clientIds.push(client.id);
      } else {
        branch.clientIds = [client.id];
      }
      await branch.save();
      return client;
    },
  }
};