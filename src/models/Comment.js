import mongoose from 'mongoose';
import User from './User';
import Like from './Like';

const { Schema } = mongoose;
const { ObjectId, Mixed } = Schema.Types;

class CommentClass{
  get author() {
    const authorId = this.authorId;
    return User.findById(authorId);
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
  
  static getList(list) {
    return Comment.find({
      '_id': {
        $in: list
      }
    });
  }
}

const CommentSchema = new Schema({
  targetId: ObjectId,
  authorId: ObjectId,
  date: Date,
  commentsIds: [ObjectId],
  text: String,
  likesIds: [ObjectId]
});

CommentSchema.loadClass(CommentClass);
const Comment = mongoose.model('Comment', CommentSchema);
export default Comment;