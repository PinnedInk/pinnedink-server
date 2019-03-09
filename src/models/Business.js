import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';

import Token from './Token';
import Service from './Service';
import Workdesk from './Workdesk';
import Master from './Master';

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
  
  get services() {
    const list = this.serviceIds;
    return Service.find({
      '_id': {
        $in: list
      }
    });
  }
  
  get workdesks() {
    const list = this.workdeskIds;
    return Workdesk.find({
      '_id': {
        $in: list
      }
    });
  }
  
  get masters() {
    const list = this.masterIds;
    return Master.find({
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
  serviceIds: [ObjectId],
  workdeskIds: [ObjectId],
  masterIds: [ObjectId]
});

BusinessSchema.loadClass(BusinessClass);
const Business = mongoose.model('Business', BusinessSchema);
export default Business;