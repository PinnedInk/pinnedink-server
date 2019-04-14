import mongoose from 'mongoose';

const { Schema } = mongoose;
const { ObjectId, Mixed } = Schema.Types;

class CategoryClass {
  
  static async getList(list) {
    return Category.find({
      '_id': { $in: list }
    });
  }
}

const CategorySchema = new Schema({
  categoryname: String,
  rating: { type: Number, default: 0 }
});

CategorySchema.loadClass(CategoryClass);
const Category = mongoose.model('Category', CategorySchema);
export default Category;