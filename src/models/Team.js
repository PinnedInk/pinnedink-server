import mongoose from 'mongoose';
import User from './User';
import Work from './Work';
import Message from './Message';
import Dialogue from './Dialogue';

const { Schema } = mongoose;
const { ObjectId, Mixed } = Schema.Types;

class TeamClass{
  static getByName(inkname) {
    return Team.findOne({
      inkname
    });
  }
  
  static getList = (ids) => {
    return Team.find({});
  };
  
  get members() {
    const list = this.membersIds;
    list.push(this.ownerId);
    return User.find({
      '_id': {
        $in: list
      }
    });
  }
  
  get dialogues() {
    const list = this.dialogueIds;
    list.push(this.ownerId);
    return Dialogue.find({
      '_id': {
        $in: this.dialogueIds
      }
    });
  }
  
  get owner() {
    return User.findById(this.ownerId);
  }
  
  get followers() {
    const list = this.followersIds;
    return User.find({
      '_id': {
        $in: list
      }
    });
  }
  
  get messages() {
    const list = this.messagesIds;
    return Message.find({
      '_id': {
        $in: list
      }
    });
  }
  
  get works() {
    const members = this.membersIds;
    members.push(this.ownerId);
    return Work.find({
      'authorId': {
        $in: members
      }
    });
  }
  
}

const TeamSchema = new Schema({
  description: Mixed,
  membersIds: [ObjectId],
  ownerId: ObjectId,
  inkname: String,
  name: String,
  followersIds: [ObjectId],
  messagesIds: [ObjectId],
  thumbUrl: String,
  avatarUrl: String,
  email: String,
  tags: [String],
  dialogueIds: [ObjectId],
  locationId: ObjectId
});

TeamSchema.loadClass(TeamClass);
const Team = mongoose.model('Team', TeamSchema);
export default Team;