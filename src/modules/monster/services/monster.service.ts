/* eslint-disable new-cap */
/* eslint-disable no-useless-constructor */
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MonsterDocument } from '../../../models/monster.model';
import { CreateMonsterDto } from '../dto/create-monster.dto';
import { UpdateMonsterDto } from '../dto/update-monster.dto';

@Injectable()
export class MonsterService {
    constructor (@InjectModel('Monster') private readonly monsterModel: Model<MonsterDocument>) {}

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

    async findAll (): Promise<MonsterDocument[]> {
        try {
            return await this.monsterModel.find().exec();
        } catch (error) {
            throw new InternalServerErrorException('Error finding all monsters');
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

    async addGoldToMonster (id: string, amount: number): Promise<MonsterDocument> {
        try {
            const monster = await this.monsterModel.findById(id);
            if (!monster) {
                throw new NotFoundException(`Monster with ID ${id} not found`);
            }
            monster.goldBalance = (monster.goldBalance || 0) + amount;
            return await monster.save();
        } catch (error) {
            if (error instanceof Error) {
                throw new InternalServerErrorException(`Failed to add gold to monster: ${error.message}`);
            } else {
                throw new InternalServerErrorException('Failed to add gold to monster due to an unknown error');
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

    async addVote (id: string): Promise<MonsterDocument> {
        const monster = await this.monsterModel.findById(id).exec();
        if (!monster) {
            throw new NotFoundException(`Monster with ID "${id}" not found`);
        }
        monster.votes += 1;
        return monster.save();
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
