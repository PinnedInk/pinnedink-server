import { User, Work, Team, Location, Event } from '../models';
export default {
  Query: {
    markers: async(_, { geolocation }) => {
      const NEAR_SPHERE_DISTANCE = process.env.NEAR_SPHERE_DISTANCE;
      
      if (geolocation.coordinates){
        return await Location.find({ geolocation: { $nearSphere: { $geometry: geolocation , $maxDistance: NEAR_SPHERE_DISTANCE } } });
      }
    },
    
  },
  Mutation: {
    getLocation: async(err, { id, geolocation, name }, { user }) => {

      const location = await Location.create({
        holderId: id,
        geolocation,
        name
      });

      let target = await User.findByIdAndUpdate(id, {'locationId': location.id } , { new: true });
      if (!target) {
        target = await Team.findByIdAndUpdate(id, {'locationId': location.id } , { new: true });
      }
      if (!target) {
        target = await Work.findByIdAndUpdate(id, {'locationId': location.id } , { new: true });
      }
      if (!target) {
        target = await Event.findByIdAndUpdate(id, {'locationId': location.id } , { new: true });
      }
      
      return target;
    }
  }
};