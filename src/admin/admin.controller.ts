import { Body, Controller, Get, Patch, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ChangeStatusDto } from 'src/orders/orders.dto';

@Controller('admin')
export class AdminController {
    ordersService: any;
    constructor(private readonly adminService: AdminService) {}

    @Get('me')
    async me(@Req() req: Request) {
        const userId = req['user'].id;
        return this.adminService.me(userId);
    }

    @Patch('changeStatus')
        async changeStatus(@Body() changeStatusDto: ChangeStatusDto) {
        return this.adminService.changeStatus(changeStatusDto);
    }
}
