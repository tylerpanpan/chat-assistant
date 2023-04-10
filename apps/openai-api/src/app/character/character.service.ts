import { EntityRepository } from "@mikro-orm/core";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "../user/entities/user.entity";
import { Character } from "./character.entity";

@Injectable()
export class CharacterService {

  constructor(
    @InjectRepository(Character)
    private characterRepository: EntityRepository<Character>,
  ) { }

  async getCharacters(user: User) {
    return this.characterRepository.find({ $or: [{
      user
    }, {
      isDefault: true
    }] }, { orderBy: { isDefault: 'desc', id: 'desc' } });
  }

  async createCharacter(user: User, name: string, definition: string) {
    const character = new Character();
    character.definition = definition;
    character.user = user;
    character.name = name;

    await this.characterRepository.persistAndFlush(character)

    return character;
  }

  async updateCharacter(id: number, user: User, name: string, definition: string) {

    const character = await this.characterRepository.findOne(id);
    if (user != character.user) {
      throw new NotFoundException('Character not found')
    }

    character.definition = definition;
    character.name = name;
    await this.characterRepository.flush()
    return character;
  }

  async deleteCharacter(id: number) {
    const character = await this.characterRepository.findOne(id);
    await this.characterRepository.removeAndFlush(character);
  }

}
