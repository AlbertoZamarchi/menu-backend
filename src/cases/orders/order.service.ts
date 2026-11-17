
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  CreateOrderDto,
  CreateOrderItemDto,
} from './dto/create-order';

import { UpdateOrderStatusDto } from './dto/update-order-status';
import { Order, OrderStatus } from './entities/order-entity';
import { OrderItem } from './entities/order-item.entity';
import { GuestCheckService } from '../guest-checks/guest-check.service';
import { ProductService } from '../products/product.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly guestCheckService: GuestCheckService,
    private readonly productService: ProductService,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  private async prepareItems(
    dto: CreateOrderItemDto,
  ): Promise<OrderItem> {
    const product = await this.productService.findOne(dto.productId);

    const price = Number(product.price);
    const subtotal = dto.quantity * price;

    return this.orderItemRepository.create({
      product,
      quantity: dto.quantity,
      price,
      subtotal,
    });
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    // Localiza ou abre uma comanda para a mesa.
    const guestCheck =
      await this.guestCheckService.findOrCreateOpened(dto.spotId);

    const items: OrderItem[] = [];
    let total = 0;

    // Prepara os itens e calcula o total.
    for (const itemDto of dto.items) {
      const item = await this.prepareItems(itemDto);

      items.push(item);
      total += Number(item.subtotal);
    }

    // Cria o pedido com seus itens.
    const order = this.orderRepository.create({
      guestCheck,
      status: OrderStatus.NEW,
      total,
      items,
    });

    // Salva o pedido e os itens pelo cascade.
    return this.orderRepository.save(order);
  }

  findAll(): Promise<Order[]> {
    return this.orderRepository.find({
      relations: {
        guestCheck: true,
        items: true,
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: {
        guestCheck: true,
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado!');
    }

    return order;
  }

  async updateStatus(
    id: string,
    dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.findOne(id);

    // Define a sequência permitida dos status.
    const nextStatus: Record<OrderStatus, OrderStatus | undefined> = {
      [OrderStatus.NEW]: OrderStatus.PREPARING,
      [OrderStatus.PREPARING]: OrderStatus.READY,
      [OrderStatus.READY]: OrderStatus.DELIVERY,
      [OrderStatus.DELIVERY]: undefined,
    };

    // Impede alterações fora da sequência correta.
    if (nextStatus[order.status] !== dto.status) {
      throw new BadRequestException(
        'Status inválido! Siga a sequência correta do pedido.',
      );
    }

    order.status = dto.status;

    return this.orderRepository.save(order);
  }
}
