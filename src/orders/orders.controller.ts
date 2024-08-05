import { Body, Controller, Get, Patch, Post, Query, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ChangeStatusDto, CreateOrderDto, GetOrderDto } from './orders.dto';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    @Post('create')
        async createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
        const userId = req['user'].id;
        return this.ordersService.createOrder(createOrderDto, userId);
    }

    @Get('get')
        async getOrder(@Query("id") id: string, @Req() req: Request) {
            const userId = req['user'].id;
            return this.ordersService.getOrder(id, userId);
    }
}
