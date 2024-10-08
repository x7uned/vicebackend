import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { QueryFindPage } from './products.controller';

@Injectable()
export class ProductsService {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  async getCategories() {
    try {
      const categoryArray = await this.redisClient.keys('category:*');

      const categories = [];
      for (const categoryItem of categoryArray) {
        const category = await this.redisClient.hgetall(categoryItem);

        categories.push(category);
      }

      return { categories, success: true };
    } catch (error) {
      console.error(error);
      return { success: false };
    }
  }

  async getBrands() {
    try {
      const brandsArray = await this.redisClient.keys('brand:*');

      const brands = [];
      for (const brandItem of brandsArray) {
        const brand = await this.redisClient.hgetall(brandItem);

        brands.push(brand);
      }

      return { brands, success: true };
    } catch (error) {
      console.error(error);
      return { success: false };
    }
  }

  async findPage(query: QueryFindPage) {
    const page = parseInt(query.page, 10) || 1;
    const pageSize = 24;
    const offset = (page - 1) * pageSize;
    const productKeys = await this.redisClient.keys('product:*');

    if (query.brand == 'DarkProject') {
      query.brand = 'Dark project';
    }

    let products = [];
    for (const productKey of productKeys) {
      const product = await this.redisClient.hgetall(productKey);

      let match = true;

      if (
        query.category &&
        query.category !== product.category &&
        query.category != 'all'
      ) {
        match = false;
      }

      if (
        query.brand &&
        query.brand !== product.brand &&
        query.brand != 'all'
      ) {
        match = false;
      }

      if (query.pricemin || query.pricemax) {
        const productPrice = Number(product.price);
        if (query.pricemin && productPrice < Number(query.pricemin)) {
          match = false;
        }
        if (query.pricemax && productPrice > Number(query.pricemax)) {
          match = false;
        }
      }

      if (match) {
        products.push(product);
      }
    }

    if (query.sort == 'bestsellers') {
      products = products.filter((p) => p.bestseller == 'true');
    } else if (query.sort == 'cheap') {
      products.sort((a, b) => {
        const aPrice = Number(a.price) ? Number(a.price) : 0;
        const bPrice = Number(b.price) ? Number(b.price) : 0;
        return aPrice - bPrice;
      });
    } else if (query.sort == 'expensive') {
      products.sort((a, b) => {
        const aPrice = Number(a.price) ? Number(a.price) : 0;
        const bPrice = Number(b.price) ? Number(b.price) : 0;
        return bPrice - aPrice;
      });
    }

    const productsSlice = products.slice(offset, offset + pageSize);

    return {
      page,
      totalPages: Math.ceil(products.length / pageSize),
      totalProducts: products.length,
      products: productsSlice,
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
