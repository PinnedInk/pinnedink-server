import mongoose from 'mongoose';
import User from './User';
import Team from './Team';
import Work from './Work';
import Event from './Event';

const { Schema } = mongoose;
const { ObjectId, Mixed } = Schema.Types;

class LocationClass{
  
  get holder() {
    const getHolder = async(holderId) => {
      let isExistHolder = {};
      let author = await User.findById({ '_id': holderId }, (err, holder) => {
        isExistHolder = holder;
      });
      if (!isExistHolder) {
        await Team.findById({ '_id': holderId }, (err, holder) => {
          isExistHolder = holder;
        });
      }
      if (!isExistHolder) {
        await Work.findById({ '_id': holderId }, (err, holder) => {
          isExistHolder = holder;
        });
      }
      if (!isExistHolder) {
        await Event.findById({ '_id': holderId }, (err, holder) => {
          isExistHolder = holder;
        });
      }
      return isExistHolder;
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
      default: [46.484395, 30.735015],
      required: true
    }
  },
  name: String
});

LocationSchema.loadClass(LocationClass);
const Location = mongoose.model('Location', LocationSchema);
export default Location;