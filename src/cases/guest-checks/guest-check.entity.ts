import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { spot } from '../spots/spot.entity';

export enum GuestCheckStatus {
  OPENED = 'OPENED',
  CLOSED = 'CLOSED'
}

@Entity('guest-check')
export class GuestCheck {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({name: 'created_at'})
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: GuestCheckStatus,
    default: GuestCheckStatus.OPENED
  })

  status: GuestCheckStatus;

  @ManyToOne(() => Spot, {nullable: false})
  @JoinColumn({ name: 'spot_id'})
  spot: spot;
}