import { Service, Category, Subcategory } from '../models';
import { createTag } from '../utils';

export default {
  // Query: {
  //   branches: async(_, { od, numm }) => {
  //     return Event.find({});
  //   },
  // },
  Mutation: {
    addService: async(_, { name, categories, subcategories, duration, cost }, { business }) => {
      const service = await Service.create({
        name,
        categories,
        subcategories,
        duration,
        cost
      });

      if (categories) {
        await createTag(categories, service, Category, 'categoryname', 'categoryIds', Service);
      }
      if (subcategories) {
        await createTag(subcategories, service, Subcategory, 'subcategoryname', 'subcategoryIds', Service);
      }
      if (business.serviceIds) {
        business.serviceIds.push(service.id);
      } else {
        business.serviceIds = [service.id];
      }
      await business.save();
      return service;
    },
  }
};