import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { CreateProductDto, NewBrandDto } from './products.dto';
import { QueryFindPage } from './products.controller';

@Injectable()
export class ProductsService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  async getBrands() {
    const brandsArray = await this.redisClient.keys('brand:*');

    const brands = [];
    for (const brandItem of brandsArray) {
      const brand = await this.redisClient.hgetall(brandItem);

      brands.push(brand)
    }


    return { brands, success: true };
  }

  async create(createProductDto: CreateProductDto) {
    const { category, title, subtitle, image, brand, price, bestseller } = createProductDto;
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
      category: category.toLowerCase().replace(/\s/g, ''),
      title,
      subtitle,
      image,
      brand: brand.toLowerCase().replace(/\s/g, ''),
      price,
      bestseller
    });

    const existingBrands = await this.redisClient.keys(`brand:${brand}`);

    if (!existingBrands || existingBrands.length === 0) {
      await this.redisClient.hmset(`brand:${brand}`, {
        brandtitle: brand,
        brand: brand.toLowerCase().replace(/\s/g, '')
      });
    }

    return { productId, success: true };
  }

  async findPage(query: QueryFindPage) {
    const page = parseInt(query.page, 10) || 1;
    const pageSize = 24;
    const offset = (page - 1) * pageSize;
    const productKeys = await this.redisClient.keys('product:*');

    if(query.brand == 'DarkProject') {
      query.brand = 'Dark project'
    }

    let products = [];
    for (const productKey of productKeys) {
      const product = await this.redisClient.hgetall(productKey);

      let match = true;

      if (query.category && query.category !== product.category && query.category != 'all') {
        match = false;
      }

      if (query.brand && query.brand !== product.brand && query.brand != 'all') {
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
