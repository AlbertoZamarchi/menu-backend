import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsUUID, ValidateNested } from "class-validator";

export class CrateOrderItemDto {
    @IsUUID()
    productId: string;

    @IsInt()
    @IsPossitive()
    quantity: number;
}

export class CreateOrderDto {
    @IsUUID()
    spotId: string;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({each: true})
    @Type(() => CreateOrderDto)
    items: CreateOrderItemDto[];
}