import { GraphQLClient } from "graphql-request";

export const createGraphqlClient = (token?: string) => {
    return new GraphQLClient('https://unique-server.onrender.com/graphql', {
        credentials: "include"
    });
}
