import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OSS from 'ali-oss'
import { User } from "../user/entities/user.entity";
import moment from "moment";
import crypto from 'crypto'
@Injectable()
export class UploadService {

  client: OSS

  constructor(
    private configService: ConfigService,
  ) {
    this.client = new OSS({
      region: this.configService.get('oss.region'),
      accessKeyId: this.configService.get('oss.accessKeyId'),
      accessKeySecret: this.configService.get('oss.accessKeySecret'),
      bucket: this.configService.get('oss.bucket'),
    })
  }

  async ossSignature(user: User) {
    const policy = {
      expiration: moment().add('second', 3600).toDate().toISOString(),
      conditions: [
        ['content-length-range', 0, 1024 * 1024 * 10],
        ['starts-with', '$key', `img/${user.id}/`],
      ]
    }
    const policyBase64 = Buffer.from(JSON.stringify(policy)).toString('base64')
    //hmac sha1
    const signature = crypto.createHmac('sha1', this.configService.get('oss.accessKeySecret')).update(policyBase64).digest('base64')
    return {
      signature,
      dir : `img/${user.id}/`,
      policy: policyBase64,
      accessKeyId: this.configService.get('oss.accessKeyId'),
      host: this.configService.get('oss.domain'),
      expire: policy.expiration
    }
  }


  upload() {

  }


  async uploadToOSS(file: Express.Multer.File, user: User) {

    //get file origin suffix and generate a new file name
    const suffix = file.originalname.split('.').pop()
    const fileName = `img/${user.id}/${Date.now()}.${suffix}`
    //upload file to oss
    const result = await this.client.put(fileName, file.path)

    return `${this.configService.get('oss.domain')}/${result.name}`
  }
}