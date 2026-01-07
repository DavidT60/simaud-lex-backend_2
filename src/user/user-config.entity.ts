import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserConfig {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'light' })
  theme: string;

  @Column({ default: 'es' })
  language: string;

  @Column({ default: true })
  notifications_enabled: boolean;

  @OneToOne(() => User, (user) => user.config)
  @JoinColumn()
  user: User;
}
