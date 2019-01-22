import { gql } from 'apollo-server';

const IResponsable = gql`
  interface IResponsable {
    id: ID! @unique
    author: ISender
    date: Date
    target: IResponsable
  }
`;

export default IResponsable;
