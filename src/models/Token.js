import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import Comment from './Comment';
import Like from './Like';
import User from "./User";

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

class TokenClass {
  get owner() {
    const email = this.ownerId;
    return User.findOne({ email });
  }
  verify() {
    const sessionSecret = process.env.SESSION_SECRET;
    return jwt.verify(this.key, sessionSecret);
  }
}

const Token =  new Schema({
  views: [ObjectId],
  ownerId: String,
  key: String,
  provider: String
})

Token.loadClass(TokenClass);
export default mongoose.model('Token', Token);