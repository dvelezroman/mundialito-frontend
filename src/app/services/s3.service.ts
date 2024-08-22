import { Injectable } from '@angular/core';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { from } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class S3Service {
  private s3Client: S3Client;

  constructor() {
    // Initialize S3 client
    this.s3Client = new S3Client({
      region: environment.aws_region,
      credentials: {
        accessKeyId: environment.accessKeyId,
        secretAccessKey: environment.secretAccessKey,
      }
    });
  }

  // Upload a file to S3
  uploadFile(file: File, bucketName: string, key: string) {
    const uploadParams = {
      Bucket: bucketName,
      Key: key,
      Body: file,
      ContentType: file.type
    };

    const command = new PutObjectCommand(uploadParams);

    return from(this.s3Client.send(command));
  }

  // Other methods for interacting with S3 can be added here
}
