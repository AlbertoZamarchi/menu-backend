import { ProductService } from './../products/product.service';
import { Injectable } from "@nestjs/common";
import { CreateOrderDto, CreateOrderItemDto } from "./dto/create-order";
import { Order, OrderStatus } from "./entities/order-entity";
import { OrderItem } from "./entities/order-item.entity";
import { GuestCheckService } from "../guest-checks/guest-check.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class OrderService {
    constructor(
        private readonly guestCheckService: GuestCheckService
        private readonly ProductService: ProductService

        @InjectRepository(Order)
        provate readonly orderRepository: Reprository<Order>,

        @InjectRepository(OrderItem)
        provate readonly orderRepository: Reprository<OrderItem>
    ){}

    async private prepareItems(dto: CreateOrderItemDto): Promise<OrderItem> {
        const product = await this.ProductService.findOne(dto.productId);
        const subtotal = dto.quatity * product.price;

        return this.orderItemRepository.create({
            product,
            quantity:dto.quantity,
            subtotal
        })
    }

    async create(dto: CreateOrderDto): Promise<Order> {
        // Regra #1: Verificar se tem comanda aberta para a mesa
        const guestChek = await this.guestCheckService.findOrCreateOpened(dto.spotId);

        // Monta o totalizador do pedido
        const items: OrderItem[] = [];
        let total = 0;

        for (const itemDto of dto.items) {
            const item = await this.prepareItems(itemDto); // Prepara para inserir no banco
            items.push(item)
            total += Number(item.subtotal)
        }

        // Monta o pedido
        const order = this.orderRepository.create({
            guestCheck,
            status: OrderStatus.NEW,
            total
        })

        //gravar no banco o pedido
        return this.orderRepository.save(order);
        
    }
}