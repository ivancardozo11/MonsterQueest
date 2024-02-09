/* eslint-disable no-useless-constructor */
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpException, HttpStatus } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from '../services/cache.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
    constructor (private readonly cacheService: CacheService, private readonly configService: ConfigService) {}

    async intercept (context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
        const ctx: GqlExecutionContext = GqlExecutionContext.create(context);
        const request = ctx.getContext().req || ctx.getContext();
        const apiKey: string | undefined = request.headers['x-api-key'];

        const key: string = `rateLimit:${apiKey}`;
        const current = await this.cacheService.get(key);
        const requests: number = current ? parseInt(current, 10) : 0;

        if (requests >= 10) {
            throw new HttpException('Rate limit exceeded - Try again in a minute', HttpStatus.TOO_MANY_REQUESTS);
        }

        await this.cacheService.set(key, (requests + 1).toString(), 60);

        return next.handle().pipe(
            tap(() => console.log(`Request processed for field: ${ctx.getInfo().fieldName}`))
        );
    }
}
