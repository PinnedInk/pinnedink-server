import mongoose from 'mongoose';
import User from './User';
import Team from './Team';
import Message from './Message';

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

class DialogueClass {
  
  static async getList(list) {
    return Dialogue.find({
      '_id': { $in: list }
    });
  }
  
  get author() {
    const getAuthor = async(authorId) => {
      let author = await User.findById(authorId);
      if (!author) {
        return await Team.findById(authorId);
      }
      return author;
    };
    return getAuthor(this.authorId);
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
      return [].concat(users).concat(teams);
    };
    return getAllFromList(list);
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