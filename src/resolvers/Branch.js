import { Branch, Business, Category } from '../models';
import { createTag } from '../utils';

export default {
  Mutation: {
    addBranch: async(_, { branchName, categories, country, postcode, siteUrl, avatarUrl, workHours, authorId, branchPhone }) => {
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
        await createTag(categories, branch, Category, 'categoryname', 'categoryIds', Branch);
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