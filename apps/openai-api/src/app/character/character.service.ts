import { EntityRepository, LoadStrategy, MikroORM } from "@mikro-orm/core";
import { EntityManager } from '@mikro-orm/mysql'
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "../user/entities/user.entity";
import { Character } from "./character.entity";
import { CreateCharacterDto } from "./dto/create.dto";
import { UpdateCharacterDto } from "./dto/update.dto";
import { Role } from "../role/role.decorator";
import { Chat } from "../chat/entities/chat.entity";

@Injectable()
export class CharacterService {

  constructor(
    @InjectRepository(Character)
    private characterRepository: EntityRepository<Character>,
    private em: EntityManager,
    private orm: MikroORM
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
    character.avatar = dto.avatar;
    character.definition = dto.definition;
    character.user = user;
    character.name = dto.name;
    character.welcome = dto.welcome;
    character.presetQuestions = dto.presetQuestions;
    character.description = dto.description;
    character.isPublic = dto.isPublic;
    character.model = dto.model;
    character.temperature = dto.temperature;
    character.frequencyPenalty = dto.frequencyPenalty;

    await this.characterRepository.persistAndFlush(character)

    return character;
  }

  async updateCharacter(id: number, user: User, dto: UpdateCharacterDto) {

    const character = await this.characterRepository.findOne(id, { populate: ['user'] });
    if (user.id != character.user.id) {
      throw new NotFoundException('Character not found')
    }
    character.avatar = dto.avatar;
    character.definition = dto.definition;
    character.name = dto.name;
    character.welcome = dto.welcome;
    character.presetQuestions = dto.presetQuestions;
    character.description = dto.description;
    character.isPublic = dto.isPublic;
    character.model = dto.model;
    character.temperature = dto.temperature;
    character.frequencyPenalty = dto.frequencyPenalty;
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

  async getRecentUsedCharacters(user: User, limit: number = 10) {
    // get recent used characters, order by last used, using querybuild
    const characters = await this.em.getConnection().execute(`
    SELECT c.* FROM chat ch
    INNER JOIN \`character\` c ON ch.character_id = c.id
    WHERE ch.user_id = ?
    GROUP BY ch.character_id
    ORDER BY ch.updated_at DESC
    LIMIT ?
  `, [user.id, limit])

    return characters.map(c=> this.characterRepository.merge(c))
  }
}
