import mongoose from 'mongoose';
import { Service, Business } from '../models';

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

class MasterClass {
  get owner() {
    const ownerId = this.ownerId;
    return Business.findById(ownerId);
  }
  
  get service() {
    const list = this.serviceIds;
    return Service.find({
      '_id': {
        $in: list
      }
    });
  }
}

const MasterSchema = new Schema({
  ownerId: ObjectId,
  email: String,
  name: String,
  surname: String,
  avatarUrl: String,
  thumbUrl: String,
  serviceIds: [ObjectId],
  birthDate: Date,
  workHours: {
    begin: Date,
    end: Date
  },
  phone: String,
  description: String,
  certificates: [String],
});

MasterSchema.loadClass(MasterClass);
const Master = mongoose.model('Master', MasterSchema);
export default Master;