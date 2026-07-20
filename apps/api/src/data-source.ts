import { DataSource } from 'typeorm';
import { User } from './entity/User.entity';
import { Conversation } from './entity/Conversation.entity';
import { ConversationMember } from './entity/ConversationMember.entity';
import { Message } from './entity/Message.entity';
import { Attachment } from './entity/Attachment.entity';
import { Story } from './entity/Story.entity';
import { Post } from './entity/Post.entity';
import { Comment } from './entity/Comment.entity';
import { Like } from './entity/Like.entity';
import { Bookmark } from './entity/Bookmark.entity';
import { Notification } from './entity/Notification.entity';
import { Report } from './entity/Report.entity';
import { Follow } from './entity/Follow.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'wavigram',
  synchronize: process.env.NODE_ENV !== 'production', // Only sync in dev
  logging: process.env.NODE_ENV === 'development',
  entities: [
    User,
    Conversation,
    ConversationMember,
    Message,
    Attachment,
    Story,
    Post,
    Comment,
    Like,
    Bookmark,
    Notification,
    Report,
    Follow
  ],
  migrations: ['src/migration/**/*.ts'],
  subscribers: ['src/subscriber/**/*.ts'],
});