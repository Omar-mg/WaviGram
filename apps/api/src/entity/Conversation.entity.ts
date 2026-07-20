import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './User.entity';
import { Message } from './Message.entity';
import { ConversationMember } from './ConversationMember.entity';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string | null; // For group chats

  @Column({ default: false })
  isGroup: boolean;

  @Column({ nullable: true })
  avatarUrl: string | null;

  @Column({ type: 'timestamp', nullable: true })
  lastMessageAt: Date | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Relationships
  @OneToMany(() => ConversationMember, (member) => member.conversation)
  conversationMembers: ConversationMember[];

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];
}