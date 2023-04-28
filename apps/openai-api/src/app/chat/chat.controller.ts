import { Body, Controller, Delete, Get, Param, ParseBoolPipe, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ChatService } from "./chat.service";
import { RolesGuard } from "../guards/roles.guard";
import { Response } from "express";
import { CreateChatDto } from "./dto/create.dto";
import { Throttle } from "@nestjs/throttler";

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('chat')
@ApiTags('chat')
@ApiBearerAuth()
export class ChatController {

  constructor(private chatService: ChatService) {

  }

  @Get('last')
  async lastChat(
    @Query('characterId') characterId: number,
    @Req() { user }
  ) {
    return this.chatService.getUserLastChat(user, characterId)
  }

  @Post('')
  createChat(
   @Body() { characterId }: CreateChatDto,
    @Req() { user }
  ) {
    return this.chatService.create(characterId, user)
  }

  @Get('')
  getAllChats(
    @Req() { user },
    @Query('characterId') characterId: number,
  ) {
    return this.chatService.getAll(user, characterId)
  }

  @Delete(':id')
  deleteChat(
    @Param('id') chatId: number,
    @Req() { user }
  ) {
    return this.chatService.delete(chatId, user)
  }

  @Get(':id')
  async getChat(
    @Param('id') chatId: number,
    @Req() { user }) {

    const chat = await this.chatService.getOne(chatId, user)

    return chat.messages.reverse()
  }

  @Post(':id/clear_message')
  async clearMessage(
    @Param('id') chatId: number,
    @Req() { user }) {

    return this.chatService.clearMessage(chatId, user)
  }

  @Post(':id')
  @Throttle(5, 1)
  async chat(
    @Param('id') chatId: number,
    @Body('text') text: string,
    @Req() { user },
    @Res() res: Response,
    @Body('stream') stream?: boolean,

  ) {
    if (stream) {
      res.append('Content-Type', 'text/event-stream')
      res.append('Cache-Control', 'no-cache')
      res.append('Connection', 'keep-alive')
      res.append('X-Accel-Buffering', 'no')
    }
    const response = await this.chatService.chat(chatId, user, text, stream, (msg) => {
      res.write(`data: ${msg}\n\n`)
    })
    if (stream) {
      //write end
      res.end()
    } else {
      res.send(response) 
    }
  }
}
