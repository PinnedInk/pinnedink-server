import { Client } from '../models';

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
      type
    }, { business }) => {
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
      if (business.clientIds) {
        business.clientIds.push(client.id);
      } else {
        business.clientIds = [client.id];
      }
      await business.save();
      return client;
    },
  }
};