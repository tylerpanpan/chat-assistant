import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OSS from 'ali-oss'
import { User } from "../user/entities/user.entity";
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