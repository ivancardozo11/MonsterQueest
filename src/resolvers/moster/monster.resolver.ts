/* eslint-disable no-useless-constructor */
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MonsterService } from '../../modules/monster/services/monster.service';
import { CreateMonsterDto } from '../../../src/modules/monster/dto/create-monster.dto';
import { UpdateMonsterDto } from '../../../src/modules/monster/dto/update-monster.dto';
import { Monster } from '../../modules/monster/entities/monster';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

@Resolver(() => Monster)
export class MonsterResolver {
    constructor (private readonly monsterService: MonsterService) {}

    @Query(() => [Monster])
    async getAllMonsters () {
        try {
            return await this.monsterService.findAll();
        } catch (error) {
            throw new InternalServerErrorException('Error retrieving monsters');
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
    async createMonster (@Args('createMonsterInput') createMonsterInput: CreateMonsterDto) {
        try {
            return await this.monsterService.create(createMonsterInput);
        } catch (error) {
            throw new InternalServerErrorException('Error creating monster');
        }
    }

    @Mutation(() => Monster)
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
    async addGoldToMonster (
        @Args('id') id: string,
            @Args('amount') amount: number
    ): Promise<Monster> {
        try {
            const updatedMonster = await this.monsterService.addGoldToMonster(id, amount);
            return {
                ...updatedMonster.toObject(),
                id: updatedMonster._id.toString()
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to add gold to monster');
        }
    }

    @Mutation(() => Monster)
    async removeGoldFromMonster (
        @Args('id') id: string,
            @Args('amount') amount: number
    ): Promise<Monster> {
        try {
            const updatedMonster = await this.monsterService.removeGoldFromMonster(id, amount);
            return {
                ...updatedMonster.toObject(),
                id: updatedMonster._id.toString()
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to remove gold from monster');
        }
    }

    @Mutation(() => Monster)
    async addVoteToMonster (@Args('id') id: string): Promise<Monster> {
        try {
            const updatedMonster = await this.monsterService.addVote(id);
            return {
                ...updatedMonster.toObject(),
                id: updatedMonster._id.toString()
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(`Monster with ID "${id}" not found`);
            }
            throw new InternalServerErrorException('Failed to add vote to monster');
        }
    }

    @Mutation(() => Monster)
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
    async deleteMonster (@Args('id') id: string): Promise<boolean> {
        try {
            await this.monsterService.delete(id);
            return true;
        } catch (error) {
            throw new InternalServerErrorException(`Error deleting monster with ID "${id}"`);
        }
    }
}
