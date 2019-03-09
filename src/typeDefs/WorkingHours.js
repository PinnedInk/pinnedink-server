import { gql } from 'apollo-server';

const WorkingHours = gql`
  input WorkingHoursInput {
    begin : Date
    end : Date
  }

  type WorkingHours {
    begin : Date
    end : Date
  }
`;

export default WorkingHours;