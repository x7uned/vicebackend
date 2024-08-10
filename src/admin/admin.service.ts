import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import Redis from 'ioredis';
import { ChangeStatusDto } from 'src/orders/orders.dto';
import { CreateProductDto } from 'src/products/products.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AdminService {
    constructor(
        @Inject('REDIS_CLIENT') private readonly redisClient: Redis
    ) {}

    async me(userId: string) {
        const existingUsers = await this.redisClient.keys('user:*');
    
        for (const userKey of existingUsers) {
          const user = await this.redisClient.hgetall(userKey);
          if (user.id === userId || user.email === userId) {
            delete user.password;
            return { success: true, user };
          }
        }
    
        return { success: false };
    }

    async create(createProductDto: CreateProductDto, userId: string) {
      const { category, title, subtitle, brand, price, image } = createProductDto;
  
      const existingProducts = await this.redisClient.keys('product:*');
  
      for (const productKey of existingProducts) {
        const product = await this.redisClient.hgetall(productKey);
        if (product.title === title) {
          throw new ConflictException('Product with this title already exists');
        }
      }
  
      const productId = uuidv4();
  
      await this.redisClient.hmset(`product:${productId}`, {
        id: productId,
        ownerId: userId,
        category: category.toLowerCase().replace(/\s/g, ''),
        title,
        subtitle,
        image,
        brand: brand.toLowerCase().replace(/\s/g, ''),
        price,
        bestseller: false
      });
  
      const existingBrands = await this.redisClient.keys(`brand:${brand.toLowerCase().replace(/\s/g, '')}`);
      const existingCategories = await this.redisClient.keys(`category:${category.toLowerCase().replace(/\s/g, '')}`)
  
      if (!existingBrands || existingBrands.length === 0) {
        await this.redisClient.hmset(`brand:${brand.toLowerCase().replace(/\s/g, '')}`, {
          label: brand,
          value: brand.toLowerCase().replace(/\s/g, '')
        });
      }
      if (existingCategories) {
        const categoryKey = existingCategories[0];
        await this.redisClient.hincrby(categoryKey, 'quantity', 1);
      }
  
      return { productId, success: true };
    }

    async changeStatus(changeStatusDto: ChangeStatusDto) {
      try {
          const { id, newstatus } = changeStatusDto;

          const orderKey = `order:${id}`;
          const existingOrder = await this.redisClient.hgetall(orderKey);

          if (!existingOrder) {
          throw new NotFoundException('Order not found');
          }

          existingOrder.status = newstatus;

          await this.redisClient.hmset(orderKey, existingOrder);

          return { success: true, existingOrder };
      } catch (error) {
          console.error(error);
          return { success: false, message: error.message };
      }
  }
}
