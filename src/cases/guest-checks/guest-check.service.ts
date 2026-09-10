import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuestCheck } from './guest-check.entity';
import { CreateGuestCheckDto } from './dto/create-guest-check';
import { Spot } from '../spots/spot.entity';

@Injectable()
export class GuestCheckService {
  constructor(
    @InjectRepository(GuestCheck)
    private readonly GuestCheckRepository: Repository<GuestCheck>,

     @InjectRepository(Spot)
    private readonly SpotRepository: Repository<Spot>

  ) {}

  async create(dto: CreateGuestCheckDto): Promise<GuestCheck> {

    const spot = await this.SpotRepository.findOneBy({
      id: dto.spotId,
      active: true
    });

    if (!spot) {
      throw new NotFoundException('Não foi encontrada uma mesa ativa com este ID');
    }

    // Regra #2: Não se abre comanda em mesa que EXISTA uma comanda aberta.
    const opened = await this.GuestCheckRepository.exists({
      where: { spot : { id: dto.spotId }, status. GuestCheckStatus.OPENED}
    })
    if (opened) {
      throw new ConflictException('A mesa já possui uma comanda em aberta');
    }

    // Se chegou aqui, deu boa... Grava o registro
    const GuestCheck = this.GuestCheckRepository.create({
      spot,
      status: GuestCheckStatus.OPENED
    })

    return this.guestCheckRepository.save(guestCheck);

  }

  create(dto: CreateGuestCheckDto): Promise<GuestCheck> {
  
  }

   async findOne(id: string): Promise<GuestCheck> {
      const guestCheck = await this.guestCheckRepository.findOneBy({ id });
  
      if (!guestCheck) {
        throw new NotFoundException('Comanda não encontrada!');
      }
  
      return category;
    }

  async close(id: string): Promise<GuestCheck> { 
    const guestCheck = await this.findOneBy(id);

    //Regra #1: Só posso fechar uma comanda aberta
    if (guestCheck.status == GuestChackStatus.CLOSED) {
      throw new BadRequestException('A comanda já está fechada');
    }

    // Regra #2: Não posso fechar uma comanda com pedidos que não foram entregues
    //TO_DO: Implementar isto depois (dívoda técnica)

    // Se chegou aqui, deu certo!
    guestCheck.status = GuestCheckStatus.CLOSED;

    return this.GuestCheckRepository.save(guestCheck);
  }

  findOpenedBySpotid(spotI: string) : Promise<GuestCheck | null> {
    return this.GuestCheckRepository.findOne({
      where: {
        spot: { id: spotId },
        status: GuestCheckStatus.OPENED
      },
      relations: { spot: true }
    })
  } 

  async findOrCreateOpened(spotId: string): Promise<GuestCheck> {
    const opened = await this.findOpenedBySpotid(spotId);

    // Fluxo do SIM
    if (opened) {
      return opened;
    }

    return this.create({spotId})
  }

}