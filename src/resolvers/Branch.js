import { Branch, Business, Category } from '../models';
import { createCategory, createTag } from '../utils';

export default {
  // Query: {
  //   branches: async(_, { od, numm }) => {
  //     return Event.find({});
  //   },
  // },
  Mutation: {
    addBranch: async(_, { branchName, categories, country, postcode, siteUrl, avatarUrl, date, authorId, branchPhone }) => {
      const branch = await Branch.create({
        branchName,
        country,
        postcode,
        siteUrl,
        avatarUrl,
        date,
        authorId,
        branchPhone
      });
      if (categories) {
        await createTag(categories, branch, Category, 'categoryname', 'categoryIds');
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

// updateUser: async(err, { name, inkname, description, avatarUrl, email, password, tags }, { user }) => {
//   let thumbUrl;
//   if (!user) {
//     return new Error('Authorization required');
//   }
//   if (password) {
//     password = password && User.generateHash(password);
//   }
//   if (avatarUrl) {
//     thumbUrl = `avatar/thumbnail/${avatarUrl}`;
//     avatarUrl = `avatar/${avatarUrl}`;
//   }
//   if (tags) {
//     await createTag(tags, user);
//   }
//   const payload = _.pickBy({
//     name,
//     inkname,
//     password,
//     avatarUrl,
//     thumbUrl,
//     email,
//     description
//   }, v => !!v);
//   return User.findOneAndUpdate({ '_id': user.id }, payload, { new: true });
// },