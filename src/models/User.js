import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';

import Work from './Work';
import Token from './Token';
import Team from './Team';
import Like from './Like';
import Message from './Message';

const { Schema } = mongoose;
const { ObjectId, Mixed } = Schema.Types;

class UserClass {
  validPassword(password) {
    return bcrypt.compareSync(password, this.password);
  }
  
  get works() {
    const list = this.worksIds;
    return Work.find({
      '_id': {
        $in: list
      }
    });
  }
  
  getLastNumWorks(num) {
    return Work.find({}).sort('-date').limit(num);
  }
  
  get messages() {
    const list = this.messagesIds;
    Message.find({
      '_id': {
        $in: list
      }
    });
  }
  
  get token() {
    const tokenId = this.tokenId;
    return Token.findById(tokenId);
  }
  
  get team() {
    return Team.findById(this.teamId);
  }
  get likes() {
    const list = this.likesIds;
    return Like.find({
      '_id': {
        $in: list
      }
    });
  }
  getLikeByTarget(targetId) {
    return Like.findOne({ authorId: this.id, targetId });
  }
  get following() {
    //TODO: Here should be Promise.all
    const list = this.followingIds;
    const getAllFromList = async(list) => {
      const users = await User.find({
        '_id': {
          $in: list
        }
      });
      const teams = await Team.find({
        '_id': {
          $in: list
        }
      });
      return [].concat(users).concat(teams)
    };
    return getAllFromList(list)
  }
  
  get followers() {
    const list = this.followersIds;
    const getAllFromList = async(list) => {
      const users = await User.find({
        '_id': {
          $in: list
        }
      });
      const teams = await Team.find({
        '_id': {
          $in: list
        }
      });
      return [].concat(users).concat(teams)
    };
    return getAllFromList(list)
  }
  
  get archivedWorks() {
    const list = this.archivedWorksIds;
    return Work.find({
      '_id': {
        $in: list
      }
    });
  }
  
  static generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  }
  
  static getById(id) {
    return this.findById({
      _id: id
    });
  }
}

const UserSchema = new Schema({
  avatarUrl: String,
  thumbUrl: String,
  tokenId: ObjectId,
  email: String,
  password: String,
  followersIds: [ObjectId],
  followingIds: [ObjectId],
  inkname: String,
  name: String,
  description: {
    bio: String,
    site: String,
    location: String,
    connected: Date
  },
  likesIds: [ObjectId],
  messagesIds: [ObjectId],
  worksIds: [ObjectId],
  jobsIds: [ObjectId],
  eventsIds: [ObjectId],
  tags: [String],
  teamId: ObjectId,
  archivedWorksIds: [ObjectId]
});

UserSchema.loadClass(UserClass);
const User = mongoose.model('User', UserSchema);
export default User;
