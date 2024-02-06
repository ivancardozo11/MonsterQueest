/* eslint-disable new-cap */
/* eslint-disable no-useless-constructor */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MonsterDocument } from '../../../models/monster.model';
import { CreateMonsterDto } from '../dto/create-monster.dto';
import { UpdateMonsterDto } from '../dto/update-monster.dto';

@Injectable()
export class MonsterService {
    constructor (@InjectModel('Monster') private readonly monsterModel: Model<MonsterDocument>) {}

    async create (createMonsterDto: CreateMonsterDto): Promise<MonsterDocument> {
        const createdMonster = new this.monsterModel(createMonsterDto);
        return createdMonster.save();
    }

    async findOne (id: string): Promise<MonsterDocument> {
        const monster = await this.monsterModel.findById(id).exec();
        if (!monster) {
            throw new NotFoundException(`Monster with ID "${id}" not found`);
        }
        return monster;
    }

    async findAll (): Promise<MonsterDocument[]> {
        return this.monsterModel.find().exec();
    }

    async update (id: string, updateMonsterDto: UpdateMonsterDto): Promise<MonsterDocument> {
        const updatedMonster = await this.monsterModel.findByIdAndUpdate(id, updateMonsterDto, { new: true }).exec();
        if (!updatedMonster) {
            throw new NotFoundException(`Monster with ID "${id}" not found`);
        }
        return updatedMonster;
    }

    async delete (id: string): Promise<void> {
        const result = await this.monsterModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`Monster with ID "${id}" not found`);
        }
    }
}
