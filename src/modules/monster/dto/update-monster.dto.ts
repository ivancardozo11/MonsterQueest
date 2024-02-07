import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateMonsterDto {
    @Field({ nullable: true })
    readonly name?: string;

    @Field({ nullable: true })
    readonly title?: string;

    @Field({ nullable: true })
    readonly gender?: string;

    @Field({ nullable: true })
    readonly description?: string;

    @Field(() => [String], { nullable: true })
    readonly nationality?: string[];

    @Field({ nullable: true })
    readonly image?: string;

    @Field(() => Number, { nullable: true })
    readonly goldBalance?: number;

    @Field(() => Number, { nullable: true })
    readonly speed?: number;

    @Field(() => Number, { nullable: true })
    readonly health?: number;

    @Field({ nullable: true })
    readonly secretNotes?: string;

    @Field({ nullable: true })
    readonly monsterPassword?: string;
}
