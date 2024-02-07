import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class VoteMonsterDto {
    @Field()
    readonly id!: string;
}
