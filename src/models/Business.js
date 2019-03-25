import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';
import { Token, Client, Branch } from '../models';

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

class BusinessClass {
  validPassword(password) {
    return bcrypt.compareSync(password, this.password);
  }
  
  get token() {
    const tokenId = this.tokenId;
    return Token.findById(tokenId);
  }
  
  get branches() {
    const list = this.branchIds;
    return Branch.find({
      '_id': {
        $in: list
      }
    });
  }
  

 
  static generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  }
}

const BusinessSchema = new Schema({
  tokenId: ObjectId,
  name: String,
  companyName: String,
  email: String,
  password: String,
  phoneNumber: String,
  avatarUrl: String,
  branchIds:[ObjectId]
});

BusinessSchema.loadClass(BusinessClass);
const Business = mongoose.model('Business', BusinessSchema);
export default Business;