import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { MonsterModule } from './modules/monster/monster.module';

@Module({
    imports: [
        MonsterModule,
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: join(process.cwd(), 'src/graphql/schema.gql'),
            sortSchema: true
        })
    ]
})
export class AppModule {}
