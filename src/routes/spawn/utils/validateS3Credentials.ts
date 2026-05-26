import { ListObjectsCommand, S3Client } from "@aws-sdk/client-s3";

export interface S3Credentials {
  s3url: string;
  s3bucket: string;
  s3accesskey: string;
  s3secretkey: string;
}

/**
 * Validates S3 credentials by attempting to list objects in the specified bucket.
 * @param credentials - S3 connection credentials (url, bucket, access/secret keys)
 */
export async function validateS3Credentials(
  credentials: S3Credentials,
): Promise<void> {
  const client = new S3Client({
    endpoint: credentials.s3url,
    forcePathStyle: true, // Required for some non-AWS S3 providers to make bucket part of path
    region: "us-east-1", // Can be anything but must not be empty ("")
    credentials: {
      accessKeyId: credentials.s3accesskey,
      secretAccessKey: credentials.s3secretkey,
    },
  });

  // Check if bucket string contains ':' or '/'
  let bucketName = credentials.s3bucket;
  let prefix: string | undefined = undefined;

  const separatorIndex = Math.min(
    bucketName.indexOf(":") !== -1 ? bucketName.indexOf(":") : Infinity,
    bucketName.indexOf("/") !== -1 ? bucketName.indexOf("/") : Infinity,
  );

  if (separatorIndex !== Infinity) {
    // Split into bucket and prefix (key)
    bucketName = credentials.s3bucket.substring(0, separatorIndex);
    // Remove leading slash if present in prefix
    prefix = credentials.s3bucket
      .substring(separatorIndex + 1)
      .replace(/^\//, "");
  }

  const command = new ListObjectsCommand({
    Bucket: bucketName,
    ...(prefix && { Prefix: prefix }),
  });

  await client.send(command);
}
