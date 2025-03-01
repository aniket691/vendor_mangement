import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Put,
  Delete,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/users.entity';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}



  // ✅ Update user status (Approve/Reject)
  @Patch('status/:id')
  async updateUserStatus(
    @Param('id') userId: number,
    @Body() body: { status: 'Active' | 'Inactive' },
  ): Promise<string> {
    if (!body.status) {
      throw new BadRequestException('Status is required');
    }
    return this.usersService.updateUserStatus(userId, body.status);
  }

  // ✅ Get all distributors
  @Get('distributors')
  async getDistributors(): Promise<User[]> {
    return this.usersService.getDistributors();
  }

  @Get('customers')
async getCustomers(): Promise<User[]> {
    return this.usersService.getCustomers();
}

  // ✅ Fetch all registered users
  @Get('register')
  async getRegisteredUsers(): Promise<User[]> {
    return this.usersService.getRegisteredUsers();
  }

  // ✅ Update password for a specific user
  @Patch('password/:id')
  async updatePassword(
    @Param('id') userId: number,
    @Body() body: { newPassword: string },
  ): Promise<string> {
    if (!body.newPassword) {
      throw new BadRequestException('New password is required');
    }
    return this.usersService.updatePassword(userId, body.newPassword);
  }

  // ✅ User login
  // @Post('login')
  // async login(
  //   @Body() body: { email: string; password: string },
  // ): Promise<{ token: string; role: UserRole }> {
  //   const { email, password } = body;
  //   if (!email || !password) {
  //     throw new BadRequestException('Email and password are required');
  //   }
  //   return this.usersService.login(email, password);
  // }

  // ✅ Edit user details
  @Put('edit/:id')
  editUser(@Param('id') userId: number, @Body() updateData: Partial<User>) {
    return this.usersService.editUser(userId, updateData);
  }

  // ✅ Delete user
  @Delete('delete/:id')
  deleteUser(@Param('id') userId: number) {
    return this.usersService.deleteUser(userId);
  }

  @Get('edit/:user_id')
  async getUser(@Param('user_id') userId: string): Promise<User> {
      return this.usersService.getUserById(userId);
  }

  @Post('register')
  async register(@Body() data: { email: string; password: string; name: string }): Promise<User> {
    return this.usersService.register(data);
  }
  

  // ✅ Login User & Return JWT Token
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.usersService.login(body.email, body.password);
  }

  // ✅ Upload user document
  @Put('update/:id')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 5 }])) // Max 5 files
  async updateUser(
    @Param('id') userId: number,
    @Body() body: { phone: string; address: string; shopAddress: string|null; documentTypes: string[] },
    @UploadedFiles() files: { files?: Express.Multer.File[] }
  ) {
    return this.usersService.updateUserWithDocuments(
      userId,
      body.phone,
      body.address,
      body.shopAddress||null,
      files?.files || [],
      body.documentTypes
    );
  }

}
