import mongoose from 'mongoose';
import User from './User';
import Team from './Team';
import Work from './Work';
import Event from './Event';

const { Schema } = mongoose;
const { ObjectId, Mixed } = Schema.Types;

class LocationClass {
  
  get holder() {
    const getHolder = async(holderId) => {
      let author = await User.findById(holderId);
      if (!author) {
        author = await Team.findById(holderId);
      }
      if (!author) {
        author = await Work.findById(holderId);
      }
      if (!author) {
        return await Event.findById(holderId);
      }
      return author;
    };
    
    return getHolder(this.holderId);
  }
}

const LocationSchema = new Schema({
  holderId: ObjectId,
  geolocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    }
  },
  category: {
    type: String,
    enum: ['User', 'Team', 'Event', 'Work']
  },
  name: String
});

LocationSchema.index({ geolocation: '2dsphere' });
LocationSchema.loadClass(LocationClass);
const Location = mongoose.model('Location', LocationSchema);
export default Location;