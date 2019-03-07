import mongoose from 'mongoose';
import Business from './Business';
import Category from './Category';
import Subcategory from './Subcategory';

const { Schema } = mongoose;
const { ObjectId, Mixed } = Schema.Types;

class ServiceClass {
  get author() {
    const authorId = this.authorId;
    return Business.findById(authorId);
  }
  
  get categories() {
    const list = this.categoryIds;
    return Category.find({
      '_id': {
        $in: list
      }
    });
  }
  
  get subcategories() {
    const list = this.subcategoryIds;
    return Subcategory.find({
      '_id': {
        $in: list
      }
    });
  }
}

const ServiceSchema = new Schema({
  authorId:ObjectId,
  name: String,
  categoryIds: [ObjectId],
  subcategoryIds: [ObjectId],
  duration: String,
  cost: String
});

ServiceSchema.loadClass(ServiceClass);
const Service = mongoose.model('Service', ServiceSchema);
export default Service;