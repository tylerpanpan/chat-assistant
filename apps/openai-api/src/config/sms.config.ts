import { registerAs } from "@nestjs/config";

export default registerAs('sms', () => ({
  infobip: {
    enable: process.env.SMS_INFOBIP,
    username: process.env.SMS_INFOBIP_USERNAME,
    password: process.env.SMS_INFOBIP_PASSWORD,
    vcode_template: process.env.SMS_INFOBIP_SIGN,
    sign: process.env.SMS_INFOBIP_VCODE_TEMPLATE
  }
}));