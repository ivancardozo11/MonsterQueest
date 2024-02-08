import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MonsterService } from './services/monster.service';
import { MonsterResolver } from '../../resolvers/moster/monster.resolver';
import { Monster } from '../../modules/monster/entities/monster';
import { CacheModule } from '../../common/cache/cache.module';
import { MonsterSchema } from '../../models/monster.model';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Monster.name, schema: MonsterSchema }]),
        CacheModule
    ],
    providers: [MonsterService, MonsterResolver],
    exports: [MonsterService]
})
export class MonsterModule {}
