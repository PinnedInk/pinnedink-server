import { Event, User } from '../models';

export default {
	Query: {
		events: async(_, { od, numm }) => {
			return Event.find({});
		},
	},
	Mutation: {
		addEvent: async(_, { title, description, date, place }, { user: { id } }) => {
			const authorId = id;
			const event = await Event.create({
				authorId,
				title,
				date,
				description,
				place
			});

			const user = await User.findById(authorId);
			if (user.eventsIds) {
				user.eventsIds.push(event.id);
			} else {
				user.eventsIds = [event.id];
			}
			await user.save();
			return event;
		},
	}
};
