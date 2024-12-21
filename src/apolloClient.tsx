import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const client = new ApolloClient({
  link: new HttpLink({
    uri: 'https://scandiweb-backend-a8os.onrender.com/graphql', 
    headers: {
      'Content-Type': 'application/json', 
    },
    
  }),
  cache: new InMemoryCache({
    typePolicies: {
      Attribute: {
        keyFields: false, 
      },
      AttributeSet: {
        keyFields: false, 
      }
    },
  }),
});

export default client;
