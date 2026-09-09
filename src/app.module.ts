import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './cases/categories/category.entity';
import { Product } from './cases/products/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Product])
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}