import { Branch, Business } from '../models';

export default {
  // Query: {
  //   branches: async(_, { od, numm }) => {
  //     return Event.find({});
  //   },
  // },
  Mutation: {
    addBranch: async(_, { branchName, category, country, postcode, siteUrl, avatarUrl, date, authorId, branchPhone }) => {
      
      const branch = await Branch.create({
        branchName,
        category,
        country,
        postcode,
        siteUrl,
        avatarUrl,
        date,
        authorId,
        branchPhone
      });
      
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