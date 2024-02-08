export interface User {
    id: string;
    role: string;
}

export interface GraphQLContext {
    req: {
        user: User;
    };
}
