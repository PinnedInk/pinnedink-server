import { Tag, Category, Branch } from '../models';

export const addingToIds = (obj, id, prop) => {
  if (obj[prop]) {
    obj[prop].push(id);
  } else {
    obj[prop] = [id];
  }
};

export const removeIds = async(obj, id, prop) => {
  let index = obj[prop].indexOf(id);
  if (index !== -1) {
    obj[prop].splice(index, 1);
  }
  await obj.save()
};

export const createTag = async (items, target, model, type) => {
  if (!items || !target || !model) {
    return null;
  }
  if (items.length){
    await model.bulkWrite(items.map(((item, i) => ({
      updateOne : {
        filter: { tagname: item },
        update: { $inc: { rating: 1 } },
        upsert: true
      }
    }))));
  }
  
  if (target) {
    target[type] = items;
    await target.save();
  }
};

// export const createCategory = async (categories, target) => {
//   if (!categories || !target) {
//     return null;
//   }
//   if (categories.length){
//     await Category.bulkWrite(categories.map(((category, i) => ({
//       updateOne : {
//         filter: { categoryname: category },
//         update: { $inc: { rating: 1 } },
//         upsert: true
//       }
//     }))));
//   }
//   if (target) {
//     // await Branch.findOneAndUpdate({ '_id': target.id }, {categories: categories}, { new: true });
//     target.categories = categories;
//     await target.save();
//   }
// };