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

export const createTag = async (items, target, model, type, ids) => {
  let elementsIsds = null;
  if (!items || !target || !model) {
    return null;
  }
  if (items.length){
    const generateElements = await model.bulkWrite(items.map(((item, i) => ({
      updateOne : {
        filter: { [type]: item },
        update: { $inc: { rating: 1 } },
        upsert: true
      }
    }))));
    elementsIsds = generateElements.upsertedIds;
  }
 
  for (let prop in elementsIsds) {
    if (target[ids]) {
      target[ids].push(elementsIsds[prop]);
    } else {
      target[ids] = [elementsIsds[prop]];
    }
  }
  // await target.findOneAndUpdate({ '_id': target.id }, {categories: categories}, { new: true });
  await target.save();
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