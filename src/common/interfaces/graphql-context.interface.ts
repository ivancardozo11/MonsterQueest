export interface User {
    role: string;
}

export interface GraphQLContext {
    req: {
        user: User;
    };
}
