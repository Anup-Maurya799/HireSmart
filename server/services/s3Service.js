import crypto from 'crypto';
import path from 'path';
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3 from '../config/s3.js';

const BUCKET = process.env.S3_BUCKET_NAME;

// Uploads a file buffer and returns the S3 key (path inside the bucket)
export const uploadToS3 = async ({ buffer, mimetype, originalname }, ownerId) => {
  const ext = path.extname(originalname).toLowerCase();
  // Random name: we never trust the user's filename for storage
  const key = `resumes/${ownerId}/${crypto.randomUUID()}${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      ServerSideEncryption: 'AES256', // encrypted at rest
    })
  );

  return key;
};

// Temporary link (default 5 minutes) so the bucket can stay private
export const getSignedDownloadUrl = (key, expiresIn = 300) =>
  getSignedUrl(s3, new GetObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn });

export const deleteFromS3 = (key) =>
  s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));