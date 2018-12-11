import mongoose from 'mongoose';
import User from './User';
import Team from './Team';
import Dialogue from './Dialogue';

const { Schema } = mongoose;
const { ObjectId, Mixed } = Schema.Types;

class MessageClass{
  
  static async getList(list) {
    return Message.find({
      '_id': { $in: list }
    });
    // let filteredMessages = messages.filter( async m => {
    //   console.log(m);
    //   let author = await m.author ;
    //   console.log("!!!!!", author);
    //   return author
    // });
    // // // console.log(filteredMessages.map(async m => await m.author));
    // return filteredMessages;
  }

  get target() {
    return Dialogue.findById(this.targetId);
  }
  
  get author() {
    if(this.type === 'Message'){
      return User.findById(this.authorId);
    }
    return Team.findById(this.authorId);
  }
}

const MessageSchema = new Schema({
  type: {
    type: String,
    enum: ['Invite', 'Message']
  },
  authorId: ObjectId,
  text: String,
  date: Date,
  targetId: ObjectId
});

MessageSchema.loadClass(MessageClass);
const Message = mongoose.model('Message', MessageSchema);
export default Message;