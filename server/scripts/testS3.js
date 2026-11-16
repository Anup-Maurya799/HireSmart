import 'dotenv/config';
import { uploadToS3, getSignedDownloadUrl, deleteFromS3 } from '../services/s3Service.js';

const run = async () => {
  const key = await uploadToS3(
    {
      buffer: Buffer.from('hello hiresmart'),
      mimetype: 'text/plain',
      originalname: 'test.txt',
    },
    'test-user'
  );
  console.log('Uploaded:', key);

  const url = await getSignedDownloadUrl(key, 60);
  console.log('Signed URL (valid 60s):\n', url);

  console.log('\nOpen the URL now to verify. Deleting in 20 seconds...');
  await new Promise((r) => setTimeout(r, 20000));

  await deleteFromS3(key);
  console.log('Deleted. S3 works!');
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});