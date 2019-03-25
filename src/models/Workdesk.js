import mongoose from 'mongoose';
import { Service, Business } from '../models';

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

class WorkdeskClass {
  get author() {
    const authorId = this.authorId;
    return Business.findById(authorId);
  }
  
  get service() {
    const serviceId = this.serviceId;
    return Service.findById(serviceId);
  }
}

const WorkdeskSchema = new Schema({
  authorId: ObjectId,
  title: String,
  serviceId: ObjectId,
  thumbUrl: String,
  avatarUrl: String,
  description: String,
  workHours: {
    begin: Date,
    end: Date
  },
  rental: String
});

WorkdeskSchema.loadClass(WorkdeskClass);
const Workdesk = mongoose.model('Workdesk', WorkdeskSchema);
export default Workdesk;