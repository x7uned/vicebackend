import { Controller, Get, Req } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Get('me')
    async me(@Req() req: Request) {
        const userId = req['user'].id;
        return this.adminService.me(userId);
    }
}
