import {
    Controller,
    Post,
    Get,
    Patch,
    Delete,
    Param,
    Body,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    InternalServerErrorException,
    NotFoundException,
  } from '@nestjs/common';
  import { RequestErrorsService } from './request-errors.service';
  import { FileInterceptor } from '@nestjs/platform-express';
  
  @Controller('request-errors')
  export class RequestErrorsController {
    constructor(private readonly requestErrorsService: RequestErrorsService) {}
  
    // ✅ Create a new error request (with file upload)
    @Post('create')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 500 * 1024 }, // 500KB max file size
    }),
  )
  async createRequest(@UploadedFile() file: Express.Multer.File, @Body() body: any) {
    try {
      // Check if file exists
      if (!file) {
        throw new BadRequestException('No file uploaded.');
      }

      // Proceed to create the error request
      return await this.requestErrorsService.createRequest(file, body);
    } catch (error) {
      console.error('❌ Upload Error:', error);
      throw new InternalServerErrorException('Error request creation failed.');
    }
  }

  
    // ✅ Get all requests
    @Get()
    async getAllRequests() {
      return await this.requestErrorsService.getAllRequests();
    }
  
    // ✅ Get request by ID
    @Get(':requestId')
    async getRequestById(@Param('requestId') requestId: number) {
      return await this.requestErrorsService.getRequestById(requestId);
    }
  
    // ✅ Get requests by Distributor ID
    @Get('distributor/:distributorId')
    async getRequestsByDistributorId(@Param('distributorId') distributorId: string) {
      return await this.requestErrorsService.getRequestsByDistributorId(distributorId);
    }
  
    @Patch('update-status/:requestId')
  async updateRequestStatus(
    @Param('requestId') requestId: number,
    @Body('request_status') request_status: string, // ✅ Use correct key
    @Body('rejectionReason') rejectionReason?: string
  ) {
    const updatedRequest = await this.requestErrorsService.updateRequestStatus(requestId, request_status,rejectionReason);
    if (!updatedRequest) {
      throw new NotFoundException(`Request with ID ${requestId} not found`);
    }
    return { message: 'Request status updated successfully', updatedRequest };
  }

  
    // ✅ Delete request
    @Delete('delete/:requestId')
    async deleteRequest(@Param('requestId') requestId: number) {
      return await this.requestErrorsService.deleteRequest(requestId);
    }
  }
  