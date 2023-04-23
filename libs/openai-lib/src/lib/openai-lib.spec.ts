import { OpenAILib } from './openai-lib';

describe('openaiLib', () => {
  it('should work', () => {
    const openai =  new OpenAILib('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','https://openai.notfound404.info/v1')

   return openai.chat([{role: 'user', content: 'Hi'}], true).then((res: any)=> {
    console.info(res)
     
   })
  },50000);
});
