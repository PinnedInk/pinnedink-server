import mongoose from 'mongoose';
import Comment from './Comment';
import Like from './Like';
import User from './User';

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

class WorkClass {
  get author() {
    const uid = this.authorId;
    return User.findById(uid);
  }
  
  get comments() {
    const list = this.commentsIds;
    return Comment.find({
      '_id': {
        $in: list
      }
    });
  }
  
  get likes() {
    const list = this.likesIds;
    return Like.find({
      '_id': {
        $in: list
      }
    });
  }
  
  get archived() {
    const list = this.archivedUsersIds;
    return User.find({
      '_id': {
        $in: list
      }
    });
  }
}

const WorkSchema = new Schema({
  authorId: ObjectId,
  commentsIds: [ObjectId],
  date: Date,
  description: String,
  name: String,
  thumbUrl: String,
  url: String,
  likesIds: [ObjectId],
  view: Number,
  tags: [String],
  archivedUsersIds: [ObjectId]
});

WorkSchema.loadClass(WorkClass);
export default mongoose.model('Work', WorkSchema);