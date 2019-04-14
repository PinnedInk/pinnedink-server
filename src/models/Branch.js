import mongoose from 'mongoose';
import { Service, Category, Business, Location, Workdesk, Master, Client } from '../models';

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

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
  
  get services() {
    const list = this.serviceIds;
    return Service.find({
      '_id': {
        $in: list
      }
    });
  }
  
  get author() {
    const authorId = this.authorId;
    return Business.findById(authorId);
  }
  
  get workdesks() {
    const list = this.workdeskIds;
    return Workdesk.find({
      '_id': {
        $in: list
      }
    });
  }
  
  get masters() {
    const list = this.masterIds;
    return Master.find({
      '_id': {
        $in: list
      }
    });
  }
  
  get clients() {
    const list = this.clientIds;
    return Client.find({
      '_id': {
        $in: list
      }
    });
  }
}

const BranchSchema = new Schema({
  authorId: ObjectId,
  branchName: String,
  country: String,
  postcode: String,
  branchPhone: String,
  siteUrl: String,
  avatarUrl: String,
  workHours: {
    begin: Date,
    end: Date
  },
  categoryIds: [ObjectId],
  locationId: ObjectId,
  serviceIds: [ObjectId],
  workdeskIds: [ObjectId],
  masterIds: [ObjectId],
  clientIds: [ObjectId]
});

BranchSchema.loadClass(BranchClass);
const Branch = mongoose.model('Branch', BranchSchema);
export default Branch;