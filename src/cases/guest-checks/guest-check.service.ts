import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GuestCheck, GuestCheckStatus } from './guest-check.entity';
import { CreateGuestCheckDto } from './dto/create-guest-check';
import { Spot } from '../spots/spot.entity';

@Injectable()
export class GuestCheckService {
  constructor(
    @InjectRepository(GuestCheck)
    private readonly guestCheckRepository: Repository<GuestCheck>,

    @InjectRepository(Spot)
    private readonly spotRepository: Repository<Spot>,
  ) {}

  async create(dto: CreateGuestCheckDto): Promise<GuestCheck> {
    // Regra 1: A mesa precisa existir e estar ativa.
    const spot = await this.spotRepository.findOneBy({
      id: dto.spotId,
      active: true,
    });

    if (!spot) {
      throw new NotFoundException(
        'Não foi encontrada uma mesa ativa com este ID',
      );
    }

    // Regra 2: Não abrir uma nova comanda se já existir uma aberta.
    const opened = await this.guestCheckRepository.exists({
      where: {
        spot: { id: dto.spotId },
        status: GuestCheckStatus.OPENED,
      },
    });

    if (opened) {
      throw new ConflictException(
        'A mesa já possui uma comanda aberta',
      );
    }

    // Cria e salva a nova comanda.
    const guestCheck = this.guestCheckRepository.create({
      spot,
      status: GuestCheckStatus.OPENED,
    });

    return this.guestCheckRepository.save(guestCheck);
  }

  async findOne(id: string): Promise<GuestCheck> {
    const guestCheck = await this.guestCheckRepository.findOne({
      where: { id },
      relations: { spot: true },
    });

    if (!guestCheck) {
      throw new NotFoundException('Comanda não encontrada!');
    }

    return guestCheck;
  }

  async close(id: string): Promise<GuestCheck> {
    const guestCheck = await this.findOne(id);

    // Regra 1: Não fechar uma comanda que já está fechada.
    if (guestCheck.status === GuestCheckStatus.CLOSED) {
      throw new BadRequestException(
        'A comanda já está fechada',
      );
    }

    // Regra 2: Verificar pedidos ainda não entregues.
    // TODO: Implementar essa validação posteriormente.

    guestCheck.status = GuestCheckStatus.CLOSED;

    return this.guestCheckRepository.save(guestCheck);
  }

  findOpenedBySpotid(spotId: string): Promise<GuestCheck | null> {
    return this.guestCheckRepository.findOne({
      where: {
        spot: { id: spotId },
        status: GuestCheckStatus.OPENED,
      },
      relations: { spot: true },
    });
  }

  async findOrCreateOpened(spotId: string): Promise<GuestCheck> {
    const opened = await this.findOpenedBySpotid(spotId);

    if (opened) {
      return opened;
    }

    return this.create({ spotId });
  }
}
