import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, BeforeInsert } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @ManyToOne(() => User)
  professor: User;

  @ManyToMany(() => User)
  @JoinTable()
  students: User[];

  @Column({ unique: true, nullable: true })
  identificatorId: string;

  @BeforeInsert()
  generateIdentificator() {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const randomNum = Math.floor(Math.random() * 10000);
    this.identificatorId = `${dateStr}-${randomNum}`;
  }
}
