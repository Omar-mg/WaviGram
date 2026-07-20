import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './User.entity';

@Entity('follows')
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.followers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followerId' })
  follower: User;

  @Column()
  followerId: string;

  @ManyToOne(() => User, user => user.following, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'followingId' })
  following: User;

  @Column()
  followingId: string;

  @Column({ default: false })
  isCloseFriend: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  // Indexes for efficient querying
  @Index(['followerId', 'followingId'], { unique: true })
  followerFollowingIndex: string;

  @Index(['followingId'])
  followingIndex: string;
}