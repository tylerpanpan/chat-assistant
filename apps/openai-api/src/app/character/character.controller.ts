import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CharacterService } from "./character.service";
import { CreateCharacterDto } from "./dto/create.dto";
import { UpdateCharacterDto } from "./dto/update.dto";
import { RolesGuard } from "../guards/roles.guard";
import { Role, Roles } from "../role/role.decorator";

@Controller('character')
@ApiTags('character')
@ApiBearerAuth()
export class CharacterController {

  constructor(
    private characterService: CharacterService
  ) { }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin, Role.User)
  @Post()
  async post(
    @Body() dto: CreateCharacterDto,
    @Req() { user }
  ) {
    return this.characterService.createCharacter(user, dto)
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get()
  getAll(
    @Req() { user }
  ) {
    return this.characterService.getCharacters(user);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get('/recent_used')
  recentUsed(
    @Query('count') count: number,
    @Req() { user }
  ) {
    return this.characterService.getRecentUsedCharacters(user,count);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin, Role.User)
  @Patch(':id')
  async patch(
    @Body() dto: UpdateCharacterDto,
    @Req() { user },
    @Param('id') id: number
  ) {
    return this.characterService.updateCharacter(id, user, dto)
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin, Role.User)
  @Delete(':id')
  async delete(
    @Req() { user },
    @Param('id') id: number
  ) {
    return this.characterService.deleteCharacter(id, user)
  }
}
