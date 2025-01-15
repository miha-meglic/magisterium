import { ApolloClient, InMemoryCache } from '@apollo/client/core';

export default defineNuxtPlugin(() => {
    const apolloClient = new ApolloClient({
        uri: 'http://your-graphql-endpoint',
        cache: new InMemoryCache(),
    });

    return {
        provide: {
            apollo: apolloClient,
        },
    };
});
