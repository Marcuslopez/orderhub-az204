import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

//@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT-auth')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'operator')
  create(@Body() body: Partial<Order>, @Request() req) {
    return this.ordersService.create(body, req.user);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.ordersService.remove(Number(id));
  }
}
