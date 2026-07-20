import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User.entity';
import { Conversation } from './Conversation.entity';

@Entity('conversation_members')
export class ConversationMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  conversationId: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ default: false })
  isMuted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastReadAt: Date | null;

  @Column({ default: 0 })
  unreadCount: number;

  @CreateDateColumn({ type: 'timestamp' })
  joinedAt: Date;

  // Relationships
  @ManyToOne(() => User, (user) => user.conversationMembers)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Conversation, (conversation) => conversation.conversationMembers)
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;
}