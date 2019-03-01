import mongoose from 'mongoose';
import bcrypt from 'bcrypt-nodejs';

import Token from './Token';
import Location from './Location';

const { Schema } = mongoose;
const { ObjectId, Mixed } = Schema.Types;

const EffectSchema = new Schema({
  date: { type: Date, default: Date.now() },
  type: {
    type: String,
    enum: ['Pro']
  }
});

class BusinessClass {
  validPassword(password) {
    return bcrypt.compareSync(password, this.password);
  }
  
  get token() {
    const tokenId = this.tokenId;
    return Token.findById(tokenId);
  }
  
  get location() {
    return Location.findById(this.locationId);
  }
  
  static generateHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
  }
  
  static getById(id) {
    return this.findById({
      _id: id
    });
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
  branchName: String,
  category: String,
  country: String,
  postcode: String,
  branchPhone: String,
  siteUrl: String,
  workihgHours: {
    begin : Date,
    end : Date
  },
  locationId: ObjectId
});

BusinessSchema.loadClass(BusinessClass);
const Business = mongoose.model('Business', BusinessSchema);
export default Business;