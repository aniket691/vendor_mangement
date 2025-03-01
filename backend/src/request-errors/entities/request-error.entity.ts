import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('request_errors')
export class RequestError {
  @PrimaryGeneratedColumn()
  request_id: number;

  @Column({ type: 'varchar', length: 500, nullable: false })
  request_description: string;

  @Column({ type: 'varchar', nullable: true })
  error_document: string; // Stores S3 URL

  @Column({ type: 'int', nullable: false })
  document_id: number;

  @Column({ type: 'int', nullable: false })
  category_id: number;

  @Column({ type: 'int', nullable: false })
  subcategory_id: number;

  @Column({ type: 'int', nullable: false })
  user_id: number;

  @Column({ type: 'varchar', nullable: true })
  distributor_id: string;

  @Column({ type: 'varchar', length: 50, default: 'Pending' })
  request_status: string; // Default: Pending

  @Column({ type: 'varchar', length: 10, unique: true })
  application_id: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  request_name: string; // ✅ Updated: Name Field

  @Column({ type: 'varchar', length: 100, nullable: false })
  request_email: string; // ✅ Updated: Email Field

  @CreateDateColumn({ type: 'timestamp' })
  request_date: Date;
}
