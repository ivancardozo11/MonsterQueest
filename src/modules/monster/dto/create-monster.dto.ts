export class CreateMonsterDto {
    readonly name!: string;
    readonly title?: string;
    readonly gender?: string;
    readonly description?: string;
    readonly nationality?: string[];
    readonly image?: string;
    readonly goldBalance?: number;
    readonly speed?: number;
    readonly health?: number;
    readonly secretNotes?: string;
    readonly monsterPassword!: string;
}
