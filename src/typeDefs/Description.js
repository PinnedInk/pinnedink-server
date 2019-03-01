import { gql } from 'apollo-server';

const Description = gql`
  input DesriptionInput {
    bio: String
    site: String
    location: String
  }
  type Description {
    bio: String
    site: String
    location: String
  }
`;

export default Description;