import { get_encoding } from '@dqbd/tiktoken'
import { OpenAIApi, Configuration } from 'openai'
import axios from 'axios'
import { GPTModel } from '../enums/GPTModel';
interface ChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    text: string;
    index: number;
    message: {
      content: string;
      role: 'system' | 'user' | 'assistant';
    },
    logprobs: {
      token_logprobs: string[];
      top_logprobs: string[];
      text_offset: number[];
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  isDeleted?: boolean;
  time?: string;
}

export class OpenAILib {
  private enc = get_encoding('cl100k_base')
  private openai: OpenAIApi;

  constructor(apiKey: string, basePath?: string) {
    const configuration = new Configuration({ apiKey })
    this.openai = new OpenAIApi(configuration, basePath);
  }

  async chat(message: Message[], stream: boolean = false, max_tokens = 2048) {
    return this.openai.createChatCompletion({
      messages: message,
      model: GPTModel.GPT35TURBO0301,
      stream: true
    }, { responseType: 'stream' }).then((res: any) => {
      
      res.data.on('data', (result: any) => {
        console.info('1' , result.toString())
      })
      return res.data
    })
  }

  countMessageToken(message: Message[]) {
    return message.reduce((acc, cur) => {
      return acc + this.countToken(cur.content)
    }, 0)
  }

  countToken(text: string) {
    const encoded = this.enc.encode(text);
    const length = encoded.length;
    return length
  }

  buildMessages(content: string, system: string, contexts: Message[]) {
    return [{ role: 'system', content: system } as Message, ...contexts.map(msg => ({ role: msg.role, content: msg.content } as Message)), { role: 'user', content } as Message]
  }

  buildContext(contexts: Message[], system: string = '', max_tokens = 4096): Message[] {
    const systemLength = this.countToken(system)
    return this.cutContext(contexts, max_tokens - systemLength - 512)
  }

  cutContext(contexts: Message[], max_tokens = 4096): Message[] {
    const filteredContexts = contexts.filter(ctx => !ctx.isDeleted);
    const tokenCount = this.countMessageToken(filteredContexts);

    if (tokenCount <= max_tokens || filteredContexts.length === 0) {
      return contexts;
    }

    for (const context of filteredContexts) {
      if (!context.isDeleted) {
        context.isDeleted = true;
        break;
      }
    }
    // Recursively remove more messages if necessary.
    return this.cutContext(contexts, max_tokens);
  }


}
