import { registerAs } from "@nestjs/config";

export default registerAs('system', () => ({
  uploadDir: process.env.UPLOAD_DIR,
  openAiKey: process.env.OPENAI_KEY
}));
