import mongoose from 'mongoose';
import User from './User';

const { Schema } = mongoose;
const { ObjectId } = Schema.Types;

class JobClass{
	get author() {
		const uid = this.authorId;
		return User.findById(uid);
	}
}

const JobSchema = new Schema({
  authorId: ObjectId,
  title: String,
  description: String,
  company: String,
  email: String,
  location: String,
  date: Date
});

JobSchema.loadClass(JobClass);
export default mongoose.model('Job', JobSchema);