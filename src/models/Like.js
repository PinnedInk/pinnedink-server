import mongoose from 'mongoose';
import { User } from '../models';

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

class LikeClass {
  get likes() {
    const list = this.likesIds;
    return Like.find({
      'id': {
        $in: list
      }
    });
  }
  get author() {
    return User.findById(this.authorId);
  }
  static getList(list) {
    this.find({
      '_id': {
        $in: list
      }
    })
  }
}

const LikeSchema = new Schema({
  targetId: ObjectId,
  authorId: ObjectId,
  date: Date
});

LikeSchema.loadClass(LikeClass);
const Like = mongoose.model('Like', LikeSchema);
export default Like;