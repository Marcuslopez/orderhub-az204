import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { AuditService } from '../audit/audit.service';
import { QueueService } from '../queue/queue.service';


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
    private readonly auditService: AuditService,
    private readonly queueService: QueueService,
  ) {}
  
  async create(orderDto: Partial<Order>, user?: any) {
    const order = this.orderRepository.create(orderDto);
    const savedOrder = await this.orderRepository.save(order);
    await this.queueService.sendOrderCreated(savedOrder.id);
    
   
    await this.auditService.recordEvent({
      orderId: String(savedOrder.id),      
      type: 'ORDER_CREATED',
      userEmail: user?.email,
      data: {
        customerId: savedOrder.customerId,
        total: savedOrder.total,
        status: savedOrder.status,
      },
    });
    return savedOrder;
  }

  findAll() {
    return this.orderRepository.find();
  }

  remove(id: number) {
    return this.orderRepository.delete(id);
  }
}
