import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, LoginStatus } from './entities/users.entity';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';
import { S3Service } from './s3.service';

@Injectable()
export class UsersService {
  // s3Service: any;
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly s3Service: S3Service 
  ) { }

  
  async updateUserStatus(userId: number, status: 'Active' | 'Inactive'): Promise<string> {
    const user = await this.userRepository.findOne({ where: { user_id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update status for any role
    user.user_login_status = status as LoginStatus;
    await this.userRepository.save(user);

    // Send email notification for status update
    await this.sendStatusUpdateEmail(user, status);

    return `User status updated to ${status}`;
}

// 🚀 Send Email Notification for Status Update
async sendStatusUpdateEmail(user: User, status: 'Active' | 'Inactive'): Promise<void> {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rutujadeshmukh175@gmail.com', // Your email
        pass: 'hzaj osby vnsh ctyq', // Your email app password
      },
    });

    let mailOptions = {
      from: 'rutujadeshmukh175@gmail.com',
      to: user.email,
      subject: 'Account Status Update',
      text: `Dear ${user.name},

Your account status has been updated to: ${status}.

${status === 'Active' ? 'You can now log in and access your account.' : 'Please contact support for further details.'}

Best regards,  
Aaradhya Cyber`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Status update email sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending email:', error);
    }
}



  // 🚀 Fetch All Distributors
  async getDistributors(): Promise<User[]> {
    return await this.userRepository.find({
      where: { role: UserRole.DISTRIBUTOR },
    });
  }

  async getCustomers(): Promise<User[]> {
    return await this.userRepository.find({
        where: { role: UserRole.CUSTOMER },
    });
}

  // 🚀 Fetch All Registered Users
  async getRegisteredUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  // 🚀 Update Password Without Hashing
  async updatePassword(userId: number, newPassword: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { user_id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.password = newPassword; // 🚨 Saves plain text password (Not Secure)
    await this.userRepository.save(user);

    // Send Email Notification
    await this.sendPasswordUpdateEmail(user, newPassword);

    return 'Password updated successfully, and email notification sent.';
  }
  async sendPasswordUpdateEmail(user: User, newPassword: string): Promise<void> {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rutujadeshmukh175@gmail.com', // Your email
        pass: 'hzaj osby vnsh ctyq', // Your email app password
      },
    });

    let mailOptions = {
      from: 'rutujadeshmukh175@gmail.com',
      to: user.email,
      subject: 'Your Password Has Been Updated',
      text: `Dear ${user.name},

Your password has been successfully updated.

Username:${user.email}
New Password: ${newPassword}  

For security reasons, please do not share this password with anyone.

Best regards,  
Aaradhya Cyber`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Password update email sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }


  // 🚀 Edit User Details
  async editUser(userId: number, updateData: Partial<User>): Promise<User> {
    const user = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.userRepository.update(userId, updateData);
    const updatedUser = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
    return updatedUser;
  }

  // 🚀 Delete User
  async deleteUser(userId: number): Promise<string> {
    const result = await this.userRepository.delete(userId);
    if (result.affected === 0) throw new NotFoundException('User not found');
    return 'User deleted successfully';
  }

  // 🚀 Get User by ID
  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { user_id: Number(userId) } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // 🚀 Send Email on Registration
  async sendRegistrationEmail(user: User, originalPassword: string): Promise<void> {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rutujadeshmukh175@gmail.com', // Your email
        pass: 'hzaj osby vnsh ctyq', // Your email password
      },
    });

    let mailOptions = {
      from: 'rutujadeshmukh175@gmail.com',
      to: user.email,
      subject: 'Registration Successful - Your Login Credentials',
      text: `Dear ${user.name},

You have successfully registered.

Your Username: ${user.email}
Your Password: ${originalPassword}  

Please keep this information secure.

Best regards,
Aaradhya Cyber`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Registration email sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }


  async register(data: Partial<User>): Promise<User> {
    const originalPassword: string = data.password ?? ''; // Ensure it's always a string
  
    const newUser = this.userRepository.create({ 
      ...data, 
      user_login_status: LoginStatus.ACTIVE // Default to "Approve"
    });
  
    const savedUser = await this.userRepository.save(newUser);
  
    // Send registration email
    await this.sendRegistrationEmail(savedUser, originalPassword);
  
    return savedUser;
  }
  
  

  // ✅ User login with JWT token containing all user data
  async login(email: string, password: string): Promise<{ token: string; role: UserRole }> {
    const user = await this.userRepository.findOne({ where: { email, password } });

    if (!user) throw new NotFoundException('Invalid email or password');

    // Check if user login status is "Approve"
    if (user.user_login_status !== "Active") {
        throw new UnauthorizedException('Wait for Admin Verification');
    }

    // JWT Payload (Ensure all necessary fields are included)
    const payload = { 
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        shop_address: user.shop_address,
        role: user.role,
        user_login_status: user.user_login_status,
        created_at: user.created_at,
        user_documents: user.user_documents 
    };

    // Sign JWT Token with proper secret and expiration
    const token = this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET, // Ensure you have this in your .env file
        expiresIn: '1h', // Token expiration
    });

    return { token, role: user.role };
}


 
  async updateUserWithDocuments(
    userId: number,
    phone: string,
    address: string,
    shopAddress: string|null,
    files: Express.Multer.File[],
    documentTypes: string[]
  ) {
    const user = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // ✅ Update user details
    user.phone = phone;
    user.address = address;
    user.shop_address = shopAddress||null;
    user.user_login_status = LoginStatus.INACTIVE; // Set to "Inactive"

    // ✅ Upload multiple documents
    const uploadedDocuments = await Promise.all(
      files.map(async (file, index) => ({
        document_type: documentTypes[index] || 'Unknown', // Match documentType to file
        mimetype: file.mimetype,
        file_path: await this.s3Service.uploadFile(file),
        
      }))
    );

    // ✅ Append new documents to existing ones
    user.user_documents = [...(user.user_documents || []), ...uploadedDocuments];

    await this.userRepository.save(user);
    return { message: 'User updated successfully', user };
  }

}
