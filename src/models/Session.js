import mongoose from 'mongoose';

const { Schema } = mongoose;
const { Mixed } = Schema.Types;

const Session =  new Schema({ 
  session: Mixed,
  expires: Date
})

export default mongoose.model('Session', Session);