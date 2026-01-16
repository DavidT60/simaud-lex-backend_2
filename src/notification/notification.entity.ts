import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';

export enum NotificationType {
  GRADING = 'GRADING',
  SYSTEM = 'SYSTEM',
}

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  message: string;

  @Column({ type: 'enum', enum: NotificationType, default: NotificationType.SYSTEM })
  type: NotificationType;

  @Column({ nullable: true })
  relatedEntityId: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
