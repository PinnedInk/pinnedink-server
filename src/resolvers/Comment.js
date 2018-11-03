import { Comment, Work } from "../models";

export default {
  Query: {
    comments: (_, { ids }) => Comment.getList(ids),
  },
  Mutation: {
    addComment: async (err, { target, author, text }) => {
      const comment = await Comment.create({
        targetId: target, 
        authorId: author, 
        text,
        date: Date.now()
      });
      const work = await Work.findById(target);
      if (work.commentsIds){
        work.commentsIds.push(comment.id);
      } else {
        work.commentsIds = [comment.id];
      }
      await work.save();
      return work;
    }
  }
};