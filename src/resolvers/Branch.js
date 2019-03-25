import { Branch, Business, Category } from '../models';
import { addElemsToModel } from '../utils';

export default {
  Mutation: {
    addBranch: async(_, { branchName, categories, country, postcode, siteUrl, avatarUrl, workHours, authorId, branchPhone }) => {
      console.log("user", user);
      const branch = await Branch.create({
        branchName,
        country,
        postcode,
        siteUrl,
        avatarUrl,
        workHours,
        authorId,
        branchPhone
      });
      if (categories) {
        await addElemsToModel(categories, branch, Category, 'categoryname', 'categoryIds', Branch);
      }
      
      const business = await Business.findById(authorId);
      if (business.branchIds) {
        business.branchIds.push(branch.id);
      } else {
        business.branchIds = [branch.id];
      }
      await business.save();
      return branch;
    },
  }
};