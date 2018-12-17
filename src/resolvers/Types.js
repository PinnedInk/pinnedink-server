export default {
  IUser: {
    __resolveType(data) {
      if (data.owner){
        return "Team"
      }
      return "User" // typename property must be set by your mock functions
    }
  },
  ISender: {
    __resolveType(data) {
      if (data.owner){
        return "Team"
      }
      return "User" // typename property must be set by your mock functions
    }
  },
  IEffect: {
    __resolveType(data) {
      return "Effect" // typename property must be set by your mock functions
    }
  },
  IResponsable: {
    __resolveType(data) {
      // console.log('IResponsable: ', data);
      if (data.text) {
        return "Comment";
      }

      if (data.type) {
        return "Message";
      }

      if (data.company) {
        return "Job";
      }

      if (data.url) {
        return "Work";
      }

      return "Like" // typename property must be set by your mock functions
    }
  },
  ILocatable: {
    __resolveType(data) {
      if (data.owner) {
        return "Team";
      }
      if (data.place) {
        return "Event";
      }
      if (data.archived) {
        return "Work";
      }
      
      return "User"
    }
  }
};