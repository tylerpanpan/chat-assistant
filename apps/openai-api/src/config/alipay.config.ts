import { registerAs } from "@nestjs/config";

export default registerAs('alipay', () => ({
  appId: process.env.ALIPAY_APP_ID,
  privateKey: process.env.ALIPAY_PRIVATE_KEY,
  publicKey: process.env.ALIPAY_PUBLIC_KEY,
  notifyUrl: process.env.ALIPAY_NOTIFY_URL,
  returnUrl: process.env.ALIPAY_RETURN_URL,
}));