import mongoose from 'mongoose';
import User from './User';
import Location from './Location';

const { Schema } = mongoose;
const { ObjectId, Mixed } = Schema.Types;

class EventClass{
  get author() {
    return User.findById(this.authorId);
  }
  
  get location() {
    return Location.findById(this.locationId);
  }
}

const EventSchema = new Schema({
  authorId: ObjectId,
  title: String,
  description: String,
  date: Mixed,
  place: Mixed,
  locationId: ObjectId,
  name: String
});

EventSchema.loadClass(EventClass);
export default mongoose.model('Event', EventSchema);