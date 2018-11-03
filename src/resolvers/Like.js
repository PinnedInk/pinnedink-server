import { Work, Like, Comment } from '../models';

export default {
  Mutation: {
    like: async(err, { targetId, authorId }, { user }) => {
      let target = await Work.findById(targetId);
      if (!target) {
        target = await Comment.findById(targetId);
      }
      if (target) {
        let like = await user.getLikeByTarget(targetId);
        if (like) {
          const likeId = like.id;
          let index = user.likesIds && user.likesIds.indexOf(likeId);
          if (index > -1) {
            user.likesIds.splice(index, 1);
            await user.save();
          }
          await like.remove();
          index = target.likesIds && target.likesIds.indexOf(likeId);
          if (index > -1) {
            target.likesIds.splice(index, 1);
            await target.save();
          }
        } else {
          like = await Like.create({ targetId, authorId, date: Date.now() });
          user.likesIds = user.likesIds || [];
          user.likesIds.push(like.id);
          await user.save();
          target.likesIds = target.likesIds || [];
          target.likesIds.push(like.id);
          await target.save();
        }
        return target;
      }
      
      return null;
    }
  }
};