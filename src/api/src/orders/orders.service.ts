import { Injectable } from '@nestjs/common';

export interface Order {
     id: string; 
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

create(order: Omit<Order, 'id'>): 
Order { const newOrder: Order = { id: Date.now().toString(),
     ...order,
     }; 
     this.orders.push(newOrder); 
     return newOrder; 
    }

remove(id: string) {
  const index = this.orders.findIndex(order => order.id === id);

  if (index === -1) {
    return { message: 'Order not found' };
  }

  const deleted = this.orders[index];
  this.orders.splice(index, 1);

  return {
    message: 'Order deleted',
    order: deleted,
  };
}

}
