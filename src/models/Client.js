import mongoose from 'mongoose';
import Business from './Business';

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

class ClientClass {
  get owner() {
    const ownerId = this.ownerId;
    return Business.findById(ownerId);
  }
}

const ClientSchema = new Schema({
  ownerId: ObjectId,
  phone: String,
  email: String,
  name: String,
  surname: String,
  city: String,
  avatarUrl: String,
  thumbUrl: String,
  birthDate: Date,
  sex: String,
  type: String
});

ClientSchema.loadClass(ClientClass);
const Client = mongoose.model('Client', ClientSchema);
export default Client;