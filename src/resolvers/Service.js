import { Service, Category, Subcategory, Branch } from '../models';
import { addElemsToModel } from '../utils';

export default {
  Mutation: {
    addService: async(_, { name, categories, subcategories, duration, cost, branchId }, { business }) => {
      const branch = await Branch.findById(branchId);
      const service = await Service.create({
        authorId: business.id,
        name,
        categories,
        subcategories,
        duration,
        cost
      });

      if (categories) {
        await addElemsToModel(categories, service, Category, 'categoryname', 'categoryIds', Service);
      }
      if (subcategories) {
        await addElemsToModel(subcategories, service, Subcategory, 'subcategoryname', 'subcategoryIds', Service);
      }
      
      if (branch.serviceIds) {
        branch.serviceIds.push(service.id);
      } else {
        branch.serviceIds = [service.id];
      }
      await branch.save();
      return service;
    },
  }
};