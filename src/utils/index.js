import { Tag } from '../models';

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

export const createTag = async (tags, target) => {
  if (!tags || !target) {
    return null;
  }
  if (tags.length){
    await Tag.bulkWrite(tags.map(((tag, i) => ({
      updateOne : {
        filter: { tagname: tag },
        update: { $inc: { rating: 1 } },
        upsert: true
      }
    }))));
  }
  
  if (target) {
    target.tags = tags;
    await target.save();
  }
};