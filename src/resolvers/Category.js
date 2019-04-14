import { Category } from '../models';

export default {
  Query: {
    filteredCategory: async(_, { value }) => {
      return await Category.find({"categoryname": {$regex: '^'+ value, $options: 'i'}});
    }
  }
};