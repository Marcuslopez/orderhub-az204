import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';

/*
export interface Order {
     id: number; 
     customerId: string;
      total: number; 
      status: string;
    }

@Injectable()
export class OrdersService {
private readonly orders: Order[] = [ 
  { id: '001', customerId: 'cust-001', total: 150, status: 'Pending' }, 
  { id: '002', customerId: 'cust-002', total: 220, status: 'Completed' },
  { id: '004', customerId: 'cust-004', total: 245, status: 'Cancelled' }, 
  { id: '005', customerId: 'cust-005', total: 375, status: 'Completed' },
  ];
findAll(): Order[] {
     return this.orders; 
}
*/


@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  create(orderDto: Partial<Order>) {
    const order = this.orderRepository.create(orderDto);
    return this.orderRepository.save(order);
  }

  findAll() {
    return this.orderRepository.find();
  }
}
