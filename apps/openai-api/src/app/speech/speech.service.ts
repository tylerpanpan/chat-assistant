import { EntityManager } from "@mikro-orm/core";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Character } from "../character/character.entity";
import SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import { PassThrough } from "stream";
import { error } from "console";

@Injectable()
export class SpeechService {



  constructor(
    private configService: ConfigService,
    private em: EntityManager,
  ) {

  }

  async textToSpeech(text: string, characterId: number) {
    const character = await this.em.getRepository(Character).findOne({ id: characterId });

    return new Promise<PassThrough>((resolve, reject) => {
      const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
        this.configService.get('system.speechKey'),
        this.configService.get('system.speechRegion')
      );
      speechConfig.speechSynthesisVoiceName = 'zh-CN-XiaoxiaoNeural'
      speechConfig.speechSynthesisLanguage = 'zh-CN'
      speechConfig.speechSynthesisOutputFormat = SpeechSDK.SpeechSynthesisOutputFormat.Audio16Khz64KBitRateMonoMp3;

      const outputStream = SpeechSDK.AudioOutputStream.createPullStream();

      const audioConfig = SpeechSDK.AudioConfig.fromStreamOutput(outputStream);

      const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig);
      synthesizer.speakTextAsync(
        text,
        result => {
          const { audioData } = result;
          synthesizer.close();
          const bufferStream = new PassThrough();
          bufferStream.end(Buffer.from(audioData));
          resolve(bufferStream);
        },
        err => {
          console.info(err)
          synthesizer.close();
          reject(error)
        }
      );
    })

  }
}