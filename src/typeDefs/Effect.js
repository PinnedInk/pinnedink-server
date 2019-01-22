import { gql } from 'apollo-server';

const Effect = gql`
  interface IEffect {
    date: Date
    type: EffectType
  }

  enum EffectType {
    Pro
  }

  type Effect {
    date: Date
    type: EffectType
  }
  
  extend type Mutation {
    toggleEffect(type: String!): User
  }
`;

export default Effect;