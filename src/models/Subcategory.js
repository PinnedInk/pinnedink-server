import mongoose from 'mongoose';

const { Schema } = mongoose;
const { ObjectId, Mixed } = Schema.Types;

class SubcategoryClass {
  
  static async getList(list) {
    return Subcategory.find({
      '_id': { $in: list }
    });
  }
}

const SubcategorySchema = new Schema({
  subcategoryname: String,
  rating: { type: Number, default: 0 }
});

SubcategorySchema.loadClass(SubcategoryClass);
const Subcategory = mongoose.model('Subcategory', SubcategorySchema);
export default Subcategory;