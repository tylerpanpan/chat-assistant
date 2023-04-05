import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { ChatService } from "./chat.service";

@UseGuards(AuthGuard('jwt'))
@Controller('chat')
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
    @Body() { text }: { text: string },
    @Req() { user }
  ) {
    return this.chatService.chat(chatId, user, text)
  }
}
