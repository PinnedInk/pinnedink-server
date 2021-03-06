import _ from 'lodash';

import Comment from './Comment';
import Like from './Like';
import Types from './Types';
import User from './User';
import Work from './Work';
import Team from './Team';
import Job from './Job';
import Event from './Event';
import Message from './Message';
import Tag from './Tag';
import Dialogue from './Dialogue';
import Location from './Location';

const resolvers = _.merge(Comment, Like, Types, User, Work, Job, Event, Team, Message, Tag, Dialogue, Location);

export default resolvers;
