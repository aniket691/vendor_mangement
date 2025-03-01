import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
  private s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
      region: process.env.AWS_REGION,
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!process.env.AWS_S3_BUCKET_NAME) {
      throw new InternalServerErrorException(
        'AWS S3 bucket name is not defined in environment variables'
      );
    }

    const fileKey = `users/${uuid()}-${file.originalname}`; // Upload inside "users/" folder
    const params: AWS.S3.PutObjectRequest = {
      Bucket: process.env.AWS_S3_BUCKET_NAME as string,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
      // ❌ Removed ACL: 'public-read' since the bucket does not allow ACLs
    };

    try {
      const uploadResult = await this.s3.upload(params).promise();
      return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    } catch (error) {
      throw new InternalServerErrorException(`File upload failed: ${error.message}`);
    }
  }
}
