import { User, Work, Team, Location, Event } from '../models';

const NEAR_SPHERE_DISTANCE = 10000;

export default {
  Query: {
    markers: async(_, { geolocation, categories }) => {
      if (geolocation.coordinates) {
        return await Location.find({
          geolocation: {
            $nearSphere: {
              $geometry: geolocation,
              $maxDistance: NEAR_SPHERE_DISTANCE
            }
          },
          category: categories
        });
      }
    },
  },
  Mutation: {
    getLocation: async(err, { id, geolocation, category, name }, { user }) => {
      
      const location = await Location.create({
        holderId: id,
        geolocation,
        category,
        name
      });
      
      let target = await User.findByIdAndUpdate(id, { 'locationId': location.id }, { new: true });
      if (!target) {
        target = await Team.findByIdAndUpdate(id, { 'locationId': location.id }, { new: true });
      }
      if (!target) {
        target = await Work.findByIdAndUpdate(id, { 'locationId': location.id }, { new: true });
      }
      if (!target) {
        target = await Event.findByIdAndUpdate(id, { 'locationId': location.id }, { new: true });
      }
      
      return target;
    },
    updateUserLocation: async(err, { geolocation, category, name }, { user }) => {
      let location;
      if (user.locationId) {
        await Location.findOneAndUpdate(
          { _id: user.locationId },
          { holderId: user.id, geolocation, category, name },
          { new: true });
        return user;
      } else {
        location = await Location.create({
          holderId: user.id,
          geolocation,
          category,
          name
        });
        return await User.findByIdAndUpdate(user.id, { 'locationId': location.id }, { new: true });
      }
    }
  }
};