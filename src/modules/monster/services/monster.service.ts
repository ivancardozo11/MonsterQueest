/* eslint-disable new-cap */
/* eslint-disable no-useless-constructor */
import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MonsterDocument } from '../../../models/monster.model';
import { CreateMonsterDto } from '../dto/create-monster.dto';
import { UpdateMonsterDto } from '../dto/update-monster.dto';
import { MonsterArgs } from '../dto/monster.args';
import { CacheService } from '../../../common/services/cache.service';
import { PaginationLimitExceededError } from '../../../common/errors/pagination-limit-exceeded.error';

@Injectable()
export class MonsterService {
    constructor (
        @InjectModel('Monster') private readonly monsterModel: Model<MonsterDocument>,
        private cacheService: CacheService
    ) {}

    async create (createMonsterDto: CreateMonsterDto): Promise<MonsterDocument> {
        try {
            const createdMonster = new this.monsterModel(createMonsterDto);
            return await createdMonster.save();
        } catch (error) {
            throw new InternalServerErrorException('Error creating monster');
        }
    }

    async findOne (id: string): Promise<MonsterDocument> {
        try {
            const monster = await this.monsterModel.findById(id).exec();
            if (!monster) {
                throw new NotFoundException(`Monster with ID "${id}" not found`);
            }
            return monster;
        } catch (error) {
            throw new InternalServerErrorException(`Error finding monster with ID "${id}"`);
        }
    }

    async findAll (monsterArgs: MonsterArgs): Promise<MonsterDocument[]> {
        const { limit, offset } = monsterArgs;
        const maxLimit = 5;
        const cacheKey = `monstersList_${limit}_${offset}`;

        if (limit > maxLimit) {
            throw new PaginationLimitExceededError(maxLimit);
        }

        const monsters = await this.cacheService.get(cacheKey);
        if (monsters) {
            return JSON.parse(monsters);
        }

        try {
            const results = await this.monsterModel.find().skip(offset).limit(limit).exec();
            await this.cacheService.set(cacheKey, JSON.stringify(results), 3600);
            return results;
        } catch (error) {
            throw new InternalServerErrorException('Failed to retrieve monsters');
        }
    }

    async update (id: string, updateMonsterDto: UpdateMonsterDto): Promise<MonsterDocument> {
        try {
            const updatedMonster = await this.monsterModel.findByIdAndUpdate(id, updateMonsterDto, { new: true }).exec();
            if (!updatedMonster) {
                throw new NotFoundException(`Monster with ID "${id}" not found`);
            }
            return updatedMonster;
        } catch (error) {
            throw new InternalServerErrorException(`Error updating monster with ID "${id}"`);
        }
    }

    async addGoldToMostVotedMonster (amount: number): Promise<MonsterDocument> {
        try {
            const mostVotedMonster = await this.monsterModel.findOne().sort({ votes: -1 }).exec();
            if (!mostVotedMonster) {
                throw new NotFoundException('No se encontraron monstruos con votos.');
            }

            mostVotedMonster.goldBalance = (mostVotedMonster.goldBalance || 0) + amount;
            await mostVotedMonster.save();
            return mostVotedMonster;
        } catch (error) {
            if (error instanceof Error) {
                throw new InternalServerErrorException(`Failed to add gold to the most voted monster: ${error.message}`);
            } else {
                throw new InternalServerErrorException('Failed to add gold to the most voted monster due to an unknown error');
            }
        }
    }

    async removeGoldFromMonster (id: string, amount: number): Promise<MonsterDocument> {
        try {
            const monster = await this.monsterModel.findById(id);
            if (!monster) {
                throw new NotFoundException(`Monster with ID ${id} not found`);
            }
            monster.goldBalance = (monster.goldBalance || 0) - amount;
            return await monster.save();
        } catch (error) {
            if (error instanceof Error) {
                throw new InternalServerErrorException(`Failed to remove gold from monster: ${error.message}`);
            } else {
                throw new InternalServerErrorException('Failed to remove gold from monster due to an unknown error');
            }
        }
    }

    async addVote (id: string, userId: string): Promise<MonsterDocument> {
        try {
            const monster = await this.monsterModel.findById(id);
            if (!monster) {
                throw new NotFoundException(`Monster with ID "${id}" not found`);
            }
            if (monster.votedBy && monster.votedBy.includes(userId)) {
                throw new BadRequestException(`User with ID "${userId}" has already voted for this monster`);
            }
            monster.votes += 1;
            if (!monster.votedBy) {
                monster.votedBy = [userId];
            } else {
                monster.votedBy.push(userId);
            }
            return await monster.save();
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            } else {
                if (error instanceof NotFoundException || error instanceof BadRequestException) {
                    throw error;
                } else if (error instanceof Error) {
                    throw new InternalServerErrorException(`An unexpected error occurred while trying to add a vote to the monster with ID "${id}": ${error.message}`);
                } else {
                    throw new InternalServerErrorException('An unexpected error occurred');
                }
            }
        }
    }

    async removeVote (id: string): Promise<MonsterDocument> {
        const monster = await this.monsterModel.findById(id).exec();
        if (!monster) {
            throw new NotFoundException(`Monster with ID "${id}" not found`);
        }
        if (monster.votes > 0) {
            monster.votes -= 1;
            return monster.save();
        } else {
            throw new Error(`Monster with ID "${id}" has no votes to remove`);
        }
    }

    async delete (id: string): Promise<void> {
        try {
            const result = await this.monsterModel.findByIdAndDelete(id).exec();
            if (!result) {
                throw new NotFoundException(`Monster with ID "${id}" not found`);
            }
        } catch (error) {
            throw new InternalServerErrorException(`Error deleting monster with ID "${id}"`);
        }
    }
}
