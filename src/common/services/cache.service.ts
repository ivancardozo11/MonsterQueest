import { Injectable, Logger } from '@nestjs/common';
import Redis, { Redis as RedisClient } from 'ioredis';

@Injectable()
export class CacheService {
    private readonly client: RedisClient;
    private readonly logger = new Logger(CacheService.name);

    constructor () {
        this.client = new Redis({
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
            password: process.env.REDIS_PASSWORD
        });
    }

    async get (key: string): Promise<string | null> {
        return this.client.get(key);
    }

    async set (key: string, value: string, ttl?: number): Promise<string> {
        if (ttl) {
            return this.client.set(key, value, 'EX', ttl);
        }
        return this.client.set(key, value);
    }

    async del (key: string): Promise<number> {
        return this.client.del(key);
    }
}
