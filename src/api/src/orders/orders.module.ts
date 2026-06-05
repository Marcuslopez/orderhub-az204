import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { AuditModule } from '../audit/audit.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order]), AuditModule, QueueModule,], 
  controllers: [OrdersController],
  providers: [OrdersService]
  
})
export class OrdersModule {}
