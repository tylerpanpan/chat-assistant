import { Body, Controller, Get, Param, ParseBoolPipe, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ChatService } from "./chat.service";
import { RolesGuard } from "../guards/roles.guard";
import { Response } from "express";

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
      console.info(msg)
      res.write(`data: ${JSON.stringify(msg)}\n\n`)
    })
    console.info(response)
    if (stream) {
      //write end
      res.end()
    } else {
      res.send(response) 
    }
  }
}
