import { ListObjectsCommand, S3Client } from "@aws-sdk/client-s3";

export interface S3Credentials {
  s3url: string;
  s3bucket: string;
  s3accesskey: string;
  s3secretkey: string;
}

/**
 * Checks if an IPv4 address is in a private or reserved range.
 * @param ip - IPv4 address string (e.g., "192.168.1.1")
 * @returns true if the IP is private/reserved, false otherwise
 */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return false;
  }

  const [a, b] = parts;

  // 10.0.0.0/8 - Private network
  if (a === 10) return true;

  // 172.16.0.0/12 - Private network (172.16.0.0 - 172.31.255.255)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.168.0.0/16 - Private network
  if (a === 192 && b === 168) return true;

  // 169.254.0.0/16 - Link-local
  if (a === 169 && b === 254) return true;

  // 127.0.0.0/8 - Loopback
  if (a === 127) return true;

  // 0.0.0.0 - Current network
  if (a === 0) return true;

  return false;
}

/**
 * Checks if an IPv6 address is in a private, loopback, or link-local range.
 * @param ip - IPv6 address string (e.g., "::1", "fc00::1")
 * @returns true if the IP is private/reserved, false otherwise
 */
function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  // ::1 - Loopback
  if (normalized === "::1" || normalized === "0:0:0:0:0:0:0:1") return true;

  // :: - Unspecified
  if (normalized === "::" || normalized === "0:0:0:0:0:0:0:0") return true;

  // fc00::/7 - Unique Local Addresses (ULA) - includes fc00::/8 and fd00::/8
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;

  // fe80::/10 - Link-local unicast
  if (normalized.startsWith("fe8") || normalized.startsWith("fe9")) return true;

  return false;
}

/**
 * Validates that an S3 endpoint URL is safe to use (not private/localhost/non-HTTPS).
 * Throws an error if the endpoint is invalid or potentially dangerous.
 * @param url - The S3 endpoint URL to validate
 * @throws Error if the URL is invalid or unsafe
 */
function validateS3Endpoint(url: string): void {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch (error) {
    throw new Error(
      `Invalid S3 endpoint URL: "${url}". Please provide a valid HTTPS URL.`,
      { cause: error },
    );
  }

  // Check protocol - must be HTTPS
  if (parsedUrl.protocol !== "https:") {
    throw new Error(
      `S3 endpoint must use HTTPS protocol. Got: "${parsedUrl.protocol}"`,
    );
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // Check for localhost
  if (hostname === "localhost") {
    throw new Error(
      `S3 endpoint cannot be localhost. Private/local endpoints are not allowed for security reasons.`,
    );
  }

  // Check for IPv4 private/reserved ranges
  if (isPrivateIPv4(hostname)) {
    throw new Error(
      `S3 endpoint cannot be a private or reserved IPv4 address (${hostname}). Public HTTPS endpoints only.`,
    );
  }

  // Check for IPv6 private/reserved ranges
  if (isPrivateIPv6(hostname)) {
    throw new Error(
      `S3 endpoint cannot be a private, loopback, or link-local IPv6 address (${hostname}). Public HTTPS endpoints only.`,
    );
  }
}

/**
 * Validates S3 credentials by attempting to list objects in the specified bucket.
 * @param credentials - S3 connection credentials (url, bucket, access/secret keys)
 * @throws Error if endpoint is invalid/private or if S3 access fails
 */
export async function validateS3Credentials(
  credentials: S3Credentials,
): Promise<void> {
  // Validate endpoint before creating client (SSRF protection)
  validateS3Endpoint(credentials.s3url);

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
