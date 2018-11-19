import mongoose from 'mongoose';
import User from './User';
import Team from './Team';

const { Schema } = mongoose;
const { ObjectId, Mixed } = Schema.Types;

class DialogueClass{
  
  // static async getList(list) {
  //   return Message.find({
  //     '_id': { $in: list }
  //   });
  // }

  // get target() {
  //   return User.findById(this.targetId);
  // }
  //
  // get author() {
  //   if(this.type === 'Message'){
  //     return User.findById(this.authorId);
  //   }
  //   return Team.findById(this.authorId);
  // }
}

const DialogueSchema = new Schema({
  date: Date,
  authorId: ObjectId,
  members: [ObjectId],
  messages: [ObjectId]
});

DialogueSchema.loadClass(DialogueClass);
const Dialogue = mongoose.model('Dialogue', DialogueSchema);
export default Dialogue;