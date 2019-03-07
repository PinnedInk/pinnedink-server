import { Tag, Category, Branch, Service } from '../models';

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

export const createTag = async (items, target, model, type, ids, targetModel) => {
  let elementsIsds = [];
  if (!items || !target || !model) {
    return null;
  }
  if (items.length){
    const generateElements = await model.bulkWrite(items.map(((item, i) => ({
      updateOne : {
        filter: { [type]: item },
        update: { $inc: { rating: 1 } },
        upsert: true,
        new: true
      }
    }))));
    for (let prop in generateElements.upsertedIds){
      elementsIsds.push(generateElements.upsertedIds[prop]);
    }
  }
  if(elementsIsds.length){
    elementsIsds.map(async(elem)=>{
      await targetModel.findOneAndUpdate({ '_id': target.id }, {[ids]: elem}, { new: true });
    })
  }
};