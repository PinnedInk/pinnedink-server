import mongoose from 'mongoose';
import Location from './Location';
import Business from './Business';
import Category from './Category';

const { Schema } = mongoose;
const { ObjectId, Mixed } = Schema.Types;

class BranchClass {
  get location() {
    return Location.findById(this.locationId);
  }
  
  get categories() {
    const list = this.categoryIds;
    return Category.find({
      '_id': {
        $in: list
      }
    });
  }
  
  get author() {
    const authorId = this.authorId;
    return Business.findById(authorId);
  }
}

const BranchSchema = new Schema({
  authorId: ObjectId,
  branchName: String,
  categoryIds: [ObjectId],
  country: String,
  postcode: String,
  branchPhone: String,
  siteUrl: String,
  avatarUrl: String,
  date: Mixed,
  locationId: ObjectId
});

BranchSchema.loadClass(BranchClass);
const Branch = mongoose.model('Branch', BranchSchema);
export default Branch;