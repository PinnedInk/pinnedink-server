import { User, Work, Team, Location, Event } from '../models';

const NEAR_SPHERE_DISTANCE = 10000;

export default {
  Query: {
    markers: async(_, { geolocation }) => {
      if (geolocation.coordinates) {
        let loc = await Location.find({
          geolocation: {
            $nearSphere: {
              $geometry: geolocation,
              $maxDistance: NEAR_SPHERE_DISTANCE
            }
          }
        });
        return loc;
      }
    },
    
    // markers: async(_, { geolocation }) => {
    //   if (geolocation.coordinates) {
    //     let loc = await Location.aggregate([
    //       {
    //         $geoNear: {
    //           near: geolocation,
    //           distanceField: 'distance',
    //           maxDistance: NEAR_SPHERE_DISTANCE,
    //           query: { category: 'User' },
    //           key: 'geolocation',
    //           spherical: true,
    //         }
    //       }
    //     ]);
    //
    //     console.log(loc);
    //     return loc;
    //   }
    // },
  },
  Mutation: {
    getLocation: async(err, { id, geolocation, category }, { user }) => {
      
      const location = await Location.create({
        holderId: id,
        geolocation,
        category
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
    updateUserLocation: async(err, { geolocation, category }, { user }) => {
      let location;
      if (user.locationId) {
        await Location.findOneAndUpdate(
          { _id: user.locationId },
          { holderId: user.id, geolocation, category },
          { new: true });
        return user;
      } else {
        location = await Location.create({
          holderId: user.id,
          geolocation,
          category
        });
        return await User.findByIdAndUpdate(user.id, { 'locationId': location.id }, { new: true });
      }
    }
  }
};


// let loc = await Location.aggregate().near(
//   {
//     near: geolocation,
//     distanceField: 'calculated',
//     maxDistance: NEAR_SPHERE_DISTANCE,
//     query: { category: "User" },
//     spherical: true
//   });

