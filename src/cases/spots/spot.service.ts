import { Repository } from "typeorm";
import { Spot } from "./spot.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateCategoryDto } from "./dto/create-spot";
import { UpdateCategoryDto } from "./dto/update-spot";   

@Injectable()
export class CategoryService {

    constructor(
        @InjectRepository(Spot) 
        private readonly spotRepository: Repository<Spot> 
    ) {}

    findAll(): Promise<Spot[]> {
        return this.spotRepository.find({
            order: { name: 'ASC' }
        });
    }

    findOne(id: string): Promise<Spot> {
        const spot = this.spotRepository.findOneBy({ id });

        if (!spot) {
            throw new NotFoundException('Categoria não encontrada!');
        }

        return spot;
    }

    create(dto: CreateCategoryDto): Promise<Spot> {

        const spot = this.spotRepository.create({
            ...dto,
            name: dto.name,
            active: true
        });

        return this.spotRepository.save(spot);
    }

    async update(id: string, dto: UpdateCategoryDto): Promise<Spot> {
        const spot = await this.findOne(id);

        if (dto.name !== undefined) {
            spot.name = dto.name;
        }

        if (dto.name !== undefined) {
            spot.active = dto.active;
        }

        return this.spotRepository.save(spot);
    }

    async remove(id:string): Promise<void> {
        const spot = await this.findOne(id);
        
        await this.spotRepository.remove(spot);
    }

}