import { Subcategory } from '../models';

export default {
  Query: {
    filteredSubcategory: async(_, { value }) => {
      return await Subcategory.find({"subcategoryname": {$regex: '^'+ value, $options: 'i'}});
    }
  }
};