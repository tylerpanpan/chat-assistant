import { EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "../user/entities/user.entity";
import { Character } from "./character.entity";
import { CreateCharacterDto } from "./dto/create.dto";
import { UpdateCharacterDto } from "./dto/update.dto";
import { Role } from "../role/role.decorator";

@Injectable()
export class CharacterService {

  constructor(
    @InjectRepository(Character)
    private characterRepository: EntityRepository<Character>,
  ) { }

  async getCharacters(user: User) {
    if (user.type === Role.Guest) {
      return this.characterRepository.find({ isGuestAccess: true }, { orderBy: { isDefault: 'desc', sort: 'desc', id: 'asc' } });
    }
    return this.characterRepository.find({
      $or: [{
        user
      }, {
        isDefault: true
      }]
    }, { orderBy: { isDefault: 'desc', sort: 'desc', id: 'asc' } });
  }

  async createCharacter(user: User, dto: CreateCharacterDto) {
    const character = new Character();
    character.definition = dto.definition;
    character.user = user;
    character.name = dto.name;
    character.welcome = dto.welcome;
    character.presetQuestions = dto.presetQuestions;
    character.description = dto.description;

    await this.characterRepository.persistAndFlush(character)

    return character;
  }

  async updateCharacter(id: number, user: User, dto: UpdateCharacterDto) {

    const character = await this.characterRepository.findOne(id, { populate: ['user'] });
    if (user.id != character.user.id) {
      throw new NotFoundException('Character not found')
    }

    character.definition = dto.definition;
    character.name = dto.name;
    character.welcome = dto.welcome;
    character.presetQuestions = dto.presetQuestions;
    character.description = dto.description;

    await this.characterRepository.flush()
    return character;
  }

  async deleteCharacter(id: number, user: User) {
    const character = await this.characterRepository.findOne(id, { populate: ['user'] });
    if (user.id != character?.user.id) {
      throw new NotFoundException('Character not found')
    }
    await this.characterRepository.removeAndFlush(character);
    return character
  }

}
