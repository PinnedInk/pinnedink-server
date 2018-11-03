import { Job } from '../models';

export default {
  Query: {
    jobs: async(_, { od, numm }) => {
      return Job.find({});
    },
  },
  
  Mutation: {
    addJob: async(_, { title, description, company, email, location, url, name }, { user }) => {
      const job = await Job.create({
        authorId: user.id,
        title,
        description,
        company,
        email,
        location,
        url,
        name,
        date: Date.now()
      });
      user.jobsIds.push(job.id);
      await user.save();
      return job;
    },
  }
};