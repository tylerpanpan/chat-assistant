import { Controller, Get, Query, Res, UseGuards } from "@nestjs/common";
import { SpeechService } from "./speech.service";
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import { Response } from "express";
import { ConfigService } from "@nestjs/config";
import { PassThrough } from "stream";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@Controller('speech')
@UseGuards(AuthGuard('jwt'))
@ApiTags('speech')
@ApiBearerAuth()
export class SpeechController {

  constructor(
    private speechService: SpeechService,
  ) {

  }


  // text to speech (tts) uising stream
  @Get('tts')
  async textToSpeech(
    @Query('text') text: string,
    @Res() res: Response
  ) {
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Transfer-Encoding', 'chunked');
    const stream = await this.speechService.textToSpeech(text, 0);
    stream.pipe(res);
  }
}