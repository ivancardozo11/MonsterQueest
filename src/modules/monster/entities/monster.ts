import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Monster {
    @Field(() => ID)
        id!: string;

    @Field()
        name!: string;

    @Field({ nullable: true })
        description?: string;

    @Field()
        title!: string;

    @Field()
        gender!: string;

    @Field(() => [String])
        nationality!: string[];

    @Field()
        image!: string;

    @Field(() => Number)
        goldBalance!: number;

    @Field(() => Number)
        speed!: number;

    @Field(() => Number)
        health!: number;

    @Field({ nullable: true })
        secretNotes?: string;

    @Field()
        monsterPassword!: string;
}
