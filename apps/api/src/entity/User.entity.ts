import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ConversationMember } from './ConversationMember.entity';
import { Message } from './Message.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  avatarUrl: string | null;

  @Column({ nullable: true })
  website: string | null;

  @Column({ nullable: true })
  location: string | null;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Relationships
  @OneToMany(() => ConversationMember, (cm) => cm.user)
  conversationMembers: ConversationMember[];

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];

  // Follower/following relationships
  @OneToMany(() => Follow, follow => follow.follower)
  following: Follow[];

  @OneToMany(() => Follow, follow => follow.following)
  followers: Follow[];

  // Getter for full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}