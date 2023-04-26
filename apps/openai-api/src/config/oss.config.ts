import { registerAs } from "@nestjs/config";

export default registerAs('oss', () => ({
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET,
  region: process.env.OSS_REGION,
  domain: process.env.OSS_DOMAIN,
}));