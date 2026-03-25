
import { Body, Controller,Delete, Get, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {

    constructor(private readonly ordersService: OrdersService) {}
    @Get() 
    getOrders() 
    { return this.ordersService.findAll(); 

    }

@Delete(':id')
remove(@Param('id') id: string) {
  return this.ordersService.remove(id);
}

@Post() 
createOrder(
     @Body() body: { customerId: string; total: number; status: string }, 
    ) { 
        return this.ordersService.create(body); 
    }

    

}
