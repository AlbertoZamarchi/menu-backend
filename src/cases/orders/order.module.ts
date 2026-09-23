import { GuestCheckModule } from './../guest-checks/guest-check.module';
import { Order } from './entities/order-entity';
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Product } from '../products/product.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductModule } from '../products/product.module';

@Module({
  imports: [
    GuestCheckModule,
    ProductModule,
    TypeOrmModule.forFeature([
      Product, Order, OrderItem
    ])
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService]
})
export class OrderModule{}