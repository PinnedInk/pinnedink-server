import mongoose from 'mongoose';
import User from './User';
import Message from './Message';

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

class DialogueClass{
  
  static async getList(list) {
    return Dialogue.find({
      '_id': { $in: list }
    });
  }
  
  get author() {
    return User.findById(this.authorId);
  }
  
  get messages() {
    const list = this.messagesIds;
    return Message.find({
      '_id': {
        $in: list
      }
    });
  }
  
  get members() {
    const list = this.membersIds;
    list.push(this.authorId);
    return User.find({
      '_id': {
        $in: list
      }
    });
  }
}

const DialogueSchema = new Schema({
  date: Date,
  authorId: ObjectId,
  membersIds: [ObjectId],
  messagesIds: [ObjectId]
});

DialogueSchema.loadClass(DialogueClass);
const Dialogue = mongoose.model('Dialogue', DialogueSchema);
export default Dialogue;