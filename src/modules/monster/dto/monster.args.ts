import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class MonsterArgs {
    @Field(() => Int, { nullable: true, defaultValue: 10 })
        limit: number = 10;

    @Field(() => Int, { nullable: true, defaultValue: 0 })
        offset: number = 0;
}
