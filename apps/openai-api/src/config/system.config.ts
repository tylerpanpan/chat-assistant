import { registerAs } from "@nestjs/config";

export default registerAs('system', () => ({
  uploadDir: process.env.UPLOAD_DIR,
  openAiKey: process.env.OPENAI_KEY,
  openAiBasePath: process.env.OPENAI_BASE_PATH,
  pricePerThousandTokens: process.env.PRICE_PER_THOUSAND_TOKENS,
  gpt4PricePerThousandTokens: process.env.GPT4_PRICE_PER_THOUSAND_TOKENS,
  guestMessageLimit: process.env.GUEST_MESSAGE_LIMIT,
  inviteRewardTokens: process.env.INVITE_REWARD_TOKENS,
  userDefaultTokens: process.env.USER_DEFAULT_TOKENS,
  openAiOrgId: process.env.OPENAI_ORG_ID,
  userDefaultGpt4Limit: process.env.USER_DEFAULT_GPT4_LIMIT,
  inviteRewardGpt4Limit: process.env.INVITE_REWARD_GPT4_LIMIT,
  rechargeRewardGpt4LimitPerAmount: process.env.RECHARGE_REWARD_GPT4_LIMIT_PER_AMOUNT,
  gpt4MonthlyMessageLimit: process.env.GPT4_MONTHLY_MESSAGE_LIMIT,
}));
