import { PartialType } from "@nestjs/swagger";
import { CreateCharacterDto } from "./create.dto";

export class UpdateCharacterDto extends PartialType(CreateCharacterDto) {

}