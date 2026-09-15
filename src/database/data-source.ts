import 'reflect-metadata';
import { extname, join } from 'path';
import { DataSource } from 'typeorm';
import { EmailLog } from '../logging/entities/email-log.entity';
import { SecurityLog } from '../logging/entities/security-log.entity';
import { Template } from '../templates/entities/template.entity';

// The CLI runs outside Nest; Docker Compose supplies the database environment.
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Template, EmailLog, SecurityLog],
  migrations: [join(__dirname, 'migrations', `*${extname(__filename)}`)],
  synchronize: false,
});
