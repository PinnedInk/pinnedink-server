import mongoose from 'mongoose';
import Business from './Business';

const { Schema } = mongoose;
const { ObjectId, Mixed } = Schema.Types;

class ServiceClass {
  get author() {
    const authorId = this.authorId;
    return Business.findById(authorId);
  }
}

const ServiceSchema = new Schema({
  authorId:ObjectId,
  name: String,
  categories: [String],
  subcategories: [String],
  duration: String,
  cost: String
});

ServiceSchema.loadClass(ServiceClass);
const Service = mongoose.model('Service', ServiceSchema);
export default Service;