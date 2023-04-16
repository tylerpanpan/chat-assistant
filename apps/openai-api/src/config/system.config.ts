import { registerAs } from "@nestjs/config";

export default registerAs('system', () => ({
  uploadDir: process.env.UPLOAD_DIR,
  openAiKey: process.env.OPENAI_KEY,
  openAiBasePath: process.env.OPENAI_BASE_PATH,
  pricePerThousandTokens: process.env.PRICE_PER_THOUSAND_TOKENS,
}));
