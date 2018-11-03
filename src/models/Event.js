import mongoose from 'mongoose';
import User from './User';

const { Schema } = mongoose;
const { ObjectId, Mixed } = Schema.Types;

class EventClass{
	get author() {
		const uid = this.authorId;
		return User.findById(uid);
	}
}

const EventSchema = new Schema({
	authorId: ObjectId,
	title: String,
	description: String,
	date: Mixed,
	place: Mixed
});

EventSchema.loadClass(EventClass);
export default mongoose.model('Event', EventSchema);





















// place : {
// 	address: String,
// 	id: String,
// }
// date : {
// 	begin : String,
// 	end : String,
// },
// location: {
// 	lat: String,
// 		lng: String
// }