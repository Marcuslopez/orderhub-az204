import { Controller, Get, Post,Delete,Param, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() body: Partial<Order>) {
    return this.ordersService.create(body);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

@Delete(':id')
remove(@Param('id') id: number) {
  return this.ordersService.remove(id);
}

}

