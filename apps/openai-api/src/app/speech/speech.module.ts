import { Module } from "@nestjs/common";
import { SpeechService } from "./speech.service";
import { SpeechController } from "./speech.controller";

@Module({
  imports: [],
  controllers: [SpeechController],
  providers: [SpeechService],
})
export class SpeechModule {
  
}