import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CharacterService } from "./character.service";
import { CreateCharacterDto } from "./dto/create.dto";
import { UpdateCharacterDto } from "./dto/update.dto";

@Controller('character')
@ApiTags('character')
@ApiBearerAuth()
export class CharacterController {

  constructor(
    private characterService: CharacterService
  ) { }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async post(
    @Body() dto: CreateCharacterDto,
    @Req() { user }
  ) {
    return this.characterService.createCharacter(user,dto)
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  getAll(
    @Req() { user }
  ) {
    return this.characterService.getCharacters(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  async patch(
    @Body() dto: UpdateCharacterDto,
    @Req() { user },
    @Param('id') id: number
  ) {
    return this.characterService.updateCharacter(id, user, dto)
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async delete(
    @Req() { user },
    @Param('id') id: number
  ) {
    return this.characterService.deleteCharacter(id, user)
  }
}
