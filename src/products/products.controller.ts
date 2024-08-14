import { Controller, Delete, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

export interface QueryFindPage {
  page: string;
  search: string;
  category: string;
  pricemin: string;
  pricemax: string;
  brand: string;
  sort: string;
}

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('findPage')
  async findPage(@Query() query: QueryFindPage) {
    return this.productsService.findPage(query);
  }

  @Get('categories')
  async getCategories() {
    return this.productsService.getCategories();
  }

  @Get('brands')
  async getBrands() {
    return this.productsService.getBrands();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
