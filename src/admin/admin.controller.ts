import { Body, Controller, Get, Patch, Post, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ChangeStatusDto } from 'src/orders/orders.dto';
import { CreateProductDto } from 'src/products/products.dto';

@Controller('admin')
export class AdminController {
    ordersService: any;
    constructor(private readonly adminService: AdminService) {}

    @Get('me')
    async me(@Req() req: Request) {
        const userId = req['user'].id;
        return this.adminService.me(userId);
    }

    @Post('createProduct')
    async create(@Body() createProductDto: CreateProductDto, @Req() req: Request) {
        const userId = req['user'].id;
        return this.adminService.create(createProductDto, userId);
    }

    @Patch('changeStatus')
        async changeStatus(@Body() changeStatusDto: ChangeStatusDto) {
        return this.adminService.changeStatus(changeStatusDto);
    }
}
