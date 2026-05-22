
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customerId: string;

  @Column('decimal')
  total: number;

  @Column()
  status: string;
}