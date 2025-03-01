import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum UserRole {
  ADMIN = 'Admin',
  DISTRIBUTOR = 'Distributor',
  CUSTOMER = 'Customer',
}

export enum LoginStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 15, nullable: true })
  phone: string;

  @Column({ length: 500, nullable: true })
  address: string;


  @Column({ type: 'varchar', length: 500, nullable: true })
  shop_address: string | null;


  @Column({ type: 'enum', enum: UserRole, nullable: true })
  role: UserRole;

  @Column({ type: 'enum', enum: LoginStatus, nullable: true })
  user_login_status: LoginStatus;

  @CreateDateColumn()
  created_at: Date;

  @Column('json', { nullable: true })
  user_documents: { 
    document_type: string;
    mimetype: string;
    file_path: string;
  }[];
}
