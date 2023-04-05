import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { CharacterService } from "./character.service";

@Controller('character')
export class CharacterController {

  constructor(
    private characterService: CharacterService
  ) { }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async post(
    @Body() { name, definition }: { name: string, definition: string },
    @Req() { user }
  ) {
    return this.characterService.createCharacter(user, name, definition)
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  getAll(
    @Req() { user }
  ) {
    return this.characterService.getCharacters(user);
  }
}
