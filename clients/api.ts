import { GraphQLClient } from "graphql-request";

export const createGraphqlClient = (token?: string) => {
    return new GraphQLClient('https://another-test-server.onrender.com/graphql', {
        credentials: "include"
    });
}
