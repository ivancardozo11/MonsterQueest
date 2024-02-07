import * as mongoose from 'mongoose';

export const MonsterSchema = new mongoose.Schema({
    name: String,
    title: String,
    gender: String,
    description: String,
    nationality: [String],
    image: String,
    goldBalance: Number,
    speed: Number,
    health: Number,
    secretNotes: String,
    monsterPassword: String,
    votes: { type: Number, default: 0 }
}, { timestamps: true });

export interface MonsterDocument extends mongoose.Document {
    name: string;
    title?: string;
    gender?: string;
    description?: string;
    nationality?: string[];
    image?: string;
    goldBalance?: number;
    speed?: number;
    health?: number;
    secretNotes?: string;
    monsterPassword: string;
    votes: number;
}
