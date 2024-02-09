/* eslint-disable no-useless-catch */
/* eslint-disable no-useless-constructor */
import { NotFoundException, UseGuards, InternalServerErrorException, UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Args, Mutation, Query, Resolver, Context } from '@nestjs/graphql';
import { MonsterService } from '../../modules/monster/services/monster.service';
import { CreateMonsterDto } from '../../modules/monster/dto/create-monster.dto';
import { UpdateMonsterDto } from '../../modules/monster/dto/update-monster.dto';
import { Monster } from '../../modules/monster/entities/monster';
import { AuthGuard } from '../../common/guard/auth.guard';
import { GraphQLContext } from '../../common/interfaces/graphql-context.interface';
import { MonsterArgs } from '../../modules/monster/dto/monster.args';
import { PaginationLimitExceededError } from '../../common/errors/pagination-limit-exceeded.error';

@Resolver(() => Monster)
export class MonsterResolver {
    constructor (private readonly monsterService: MonsterService) {}

    @Query(() => [Monster])
    async getAllMonsters (@Args() monsterArgs: MonsterArgs): Promise<Monster[]> {
        try {
            const monsters = await this.monsterService.findAll(monsterArgs);
            return monsters.map(monster => ({
                id: monster._id.toString(),
                name: monster.name,
                title: monster.title || '',
                description: monster.description || '',
                gender: monster.gender || '',
                nationality: monster.nationality || [],
                image: monster.image || '',
                goldBalance: monster.goldBalance || 0,
                speed: monster.speed || 0,
                health: monster.health || 0,
                secretNotes: monster.secretNotes || '',
                monsterPassword: monster.monsterPassword,
                votes: monster.votes || 0
            }));
        } catch (error) {
            if (error instanceof PaginationLimitExceededError) {
                throw new BadRequestException(error.message);
            }
            throw new InternalServerErrorException('An unexpected error occurred');
        }
    }

    @Query(() => Monster, { nullable: true })
    async getMonster (@Args('id') id: string): Promise<Monster> {
        const monster = await this.monsterService.findOne(id);
        if (!monster) {
            throw new NotFoundException(`Monster with ID "${id}" not found`);
        }
        return {
            ...monster.toObject(),
            id: monster._id.toString()
        };
    }

    @Mutation(() => Monster)
    @UseGuards(AuthGuard)
    async createMonster (@Args('createMonsterInput') createMonsterInput: CreateMonsterDto) {
        try {
            return await this.monsterService.create(createMonsterInput);
        } catch (error) {
            throw new InternalServerErrorException('Error creating monster');
        }
    }

    @Mutation(() => Monster)
    @UseGuards(AuthGuard)
    async updateMonster (@Args('id') id: string, @Args('updateMonsterInput') updateMonsterDto: UpdateMonsterDto) {
        try {
            const updatedMonster = await this.monsterService.update(id, updateMonsterDto);
            if (!updatedMonster) {
                throw new NotFoundException(`Monster with ID "${id}" not found`);
            }
            return updatedMonster;
        } catch (error) {
            throw new InternalServerErrorException(`Error updating monster with ID "${id}"`);
        }
    }

    @Mutation(() => Monster)
    @UseGuards(AuthGuard)
    async addGoldToMostVotedMonster (
        @Args('amount') amount: number,
            @Context() context: GraphQLContext
    ): Promise<Monster> {
        if (context.req.user.role !== 'CEO') {
            throw new UnauthorizedException('Only the CEO can add gold to the most voted monster.');
        }

        try {
            const updatedMonster = await this.monsterService.addGoldToMostVotedMonster(amount);
            return {
                ...updatedMonster.toObject(),
                id: updatedMonster._id.toString()
            };
        } catch (error) {
            throw new InternalServerErrorException('Failed to add gold to the most voted monster');
        }
    }

    @Mutation(() => Monster)
    @UseGuards(AuthGuard)
    async removeGoldFromMonster (
        @Args('id') id: string,
            @Args('amount') amount: number,
            @Context() context: GraphQLContext
    ): Promise<Monster> {
        const userRole = context.req.user.role;
        if (userRole !== 'BoredMike') {
            throw new UnauthorizedException('Only Bored Mike can remove gold from monsters.');
        }

        try {
            const updatedMonster = await this.monsterService.removeGoldFromMonster(id, amount);
            return {
                ...updatedMonster.toObject(),
                id: updatedMonster._id.toString()
            };
        } catch (error) {
            throw new InternalServerErrorException('Failed to remove gold from monster');
        }
    }

    @Mutation(() => Monster)
    @UseGuards(AuthGuard)
    async addVoteToMonster (
        @Args('id') id: string,
            @Context() context: GraphQLContext
    ): Promise<Monster> {
        const userId = context.req.user.id;
        try {
            const updatedMonster = await this.monsterService.addVote(id, userId);
            return {
                ...updatedMonster.toObject(),
                id: updatedMonster._id.toString()
            };
        } catch (error) {
            if (typeof error === 'object' && error !== null && 'status' in error) {
                const specificError = error as { status: number, message: string };
                if (specificError.status === 403) {
                    throw new ForbiddenException('You have already voted for this monster.');
                }
            }
            if (error instanceof Error) {
                throw new InternalServerErrorException(`Failed to add vote to monster: ${error.message}`);
            } else {
                throw new InternalServerErrorException('Failed to add vote to monster due to an unknown error');
            }
        }
    }

    @Mutation(() => Monster)
    @UseGuards(AuthGuard)
    async removeVoteFromMonster (@Args('id') id: string): Promise<Monster> {
        try {
            const updatedMonster = await this.monsterService.removeVote(id);
            return {
                ...updatedMonster.toObject(),
                id: updatedMonster._id.toString()
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(`Monster with ID "${id}" not found`);
            }
            throw new InternalServerErrorException('Failed to remove vote from monster');
        }
    }

    @Mutation(() => Boolean)
    @UseGuards(AuthGuard)
    async deleteMonster (@Args('id') id: string): Promise<boolean> {
        try {
            await this.monsterService.delete(id);
            return true;
        } catch (error) {
            throw new InternalServerErrorException(`Error deleting monster with ID "${id}"`);
        }
    }
}
