import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { MonsterModule } from './modules/monster/monster.module';
import { CacheService } from './common/services/cache.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RateLimitInterceptor } from './common/interceptors/rate-limit.interceptor';

function getEnvironmentVariable (key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Environment variable ${key} is not defined`);
    }
    return value;
}

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true
        }),
        MongooseModule.forRoot(getEnvironmentVariable('MONGO_URI')),
        MonsterModule,
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
            sortSchema: true,
            playground: true
        })
    ],
    providers: [
        CacheService,
        {
            provide: APP_INTERCEPTOR,
            useClass: RateLimitInterceptor
        }
    ]
})
export class AppModule {}
