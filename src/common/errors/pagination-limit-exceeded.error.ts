export class PaginationLimitExceededError extends Error {
    constructor (limit: number) {
        super(`The pagination limit of ${limit} items has been exceeded.`);
        this.name = 'PaginationLimitExceededError';
    }
}
