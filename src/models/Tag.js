import mongoose from 'mongoose';

const { Schema } = mongoose;
const { ObjectId, Mixed } = Schema.Types;

class TagClass {
  
  static async getList(list) {
    return Tag.find({
      '_id': { $in: list }
    });
  }
}

const TagSchema = new Schema({
  tagname: String,
  rating: { type: Number, default: 0 }
});

TagSchema.loadClass(TagClass);
const Tag = mongoose.model('Tag', TagSchema);
export default Tag;