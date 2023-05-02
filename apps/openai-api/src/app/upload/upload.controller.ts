import { Controller, FileTypeValidator, MaxFileSizeValidator, ParseFilePipe, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import 'multer'
import { UploadService } from "./upload.service";
import { FileInterceptor } from "@nestjs/platform-express";

@UseGuards(AuthGuard('jwt'))
@ApiTags('upload')
@Controller('upload')
@ApiBearerAuth()
export class UploadController {

  constructor(
    private uploadService: UploadService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile(new ParseFilePipe({
      validators: [
        new FileTypeValidator({
          fileType: 'image/(jpeg|png|jpg)',
        }),
        new MaxFileSizeValidator({
          maxSize: 1024 * 1024 * 10,
        }),
      ]
    })) file: Express.Multer.File,
    @Req() { user }
  ) {
    const ret = await this.uploadService.uploadToOSS(file, user)
    return ret;
  }
}