import { registerAs } from "@nestjs/config";

export default registerAs('system', () => ({
  uploadDir: process.env.UPLOAD_DIR,
  openAiKey: process.env.OPENAI_KEY,
  openAiBasePath: process.env.OPENAI_BASE_PATH,
  pricePerThousandTokens: process.env.PRICE_PER_THOUSAND_TOKENS,
  guestMessageLimit: process.env.GUEST_MESSAGE_LIMIT,
  inviteRewardTokens: process.env.INVITE_REWARD_TOKENS,
  userDefaultTokens: process.env.USER_DEFAULT_TOKENS,
  openAiOrgId: process.env.OPENAI_ORG_ID,
  speechKey: process.env.SPEECH_KEY,
  speechRegion: process.env.SPEECH_REGION,
}));
