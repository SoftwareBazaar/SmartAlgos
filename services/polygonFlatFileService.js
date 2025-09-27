const path = require('path');
const fs = require('fs');
const { pipeline } = require('stream/promises');
const { createWriteStream, promises: fsp } = require('fs');
const { createGunzip } = require('zlib');
const readline = require('readline');
const { S3Client, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const POLYGON_S3_ACCESS_KEY = process.env.POLYGON_S3_ACCESS_KEY;
const POLYGON_S3_SECRET_KEY = process.env.POLYGON_S3_SECRET_KEY;
const POLYGON_S3_ENDPOINT = process.env.POLYGON_S3_ENDPOINT || 'https://files.polygon.io';
const POLYGON_S3_BUCKET = process.env.POLYGON_S3_BUCKET || 'flatfiles';

let cachedClient = null;

function ensureConfig() {
  if (!POLYGON_S3_ACCESS_KEY || !POLYGON_S3_SECRET_KEY) {
    throw new Error('Polygon S3 credentials are not configured. Set POLYGON_S3_ACCESS_KEY and POLYGON_S3_SECRET_KEY.');
  }
}

function getClient() {
  if (cachedClient) {
    return cachedClient;
  }

  ensureConfig();

  cachedClient = new S3Client({
    region: 'us-east-1',
    endpoint: POLYGON_S3_ENDPOINT,
    forcePathStyle: true,
    credentials: {
      accessKeyId: POLYGON_S3_ACCESS_KEY,
      secretAccessKey: POLYGON_S3_SECRET_KEY,
    },
  });

  return cachedClient;
}

async function listFlatFiles({ prefix = '', continuationToken, maxKeys = 50 }) {
  const client = getClient();
  const command = new ListObjectsV2Command({
    Bucket: POLYGON_S3_BUCKET,
    Prefix: prefix,
    ContinuationToken: continuationToken,
    MaxKeys: Math.min(Math.max(maxKeys || 50, 1), 1000),
  });

  const response = await client.send(command);

  const items = (response.Contents || []).map((item) => ({
    key: item.Key,
    lastModified: item.LastModified,
    size: item.Size,
    storageClass: item.StorageClass,
  }));

  return {
    items,
    isTruncated: response.IsTruncated,
    continuationToken: response.NextContinuationToken || null,
  };
}

async function getFlatFileDownloadUrl({ objectKey, expiresIn = 300 }) {
  if (!objectKey) {
    throw new Error('objectKey is required to generate a download URL.');
  }

  const client = getClient();
  const command = new GetObjectCommand({
    Bucket: POLYGON_S3_BUCKET,
    Key: objectKey,
  });

  const url = await getSignedUrl(client, command, { expiresIn: Math.min(Math.max(expiresIn, 60), 3600) });
  return { url, expiresIn: Math.min(Math.max(expiresIn, 60), 3600) };
}

async function streamFlatFile({ objectKey }) {
  if (!objectKey) {
    throw new Error('objectKey is required to stream a flat file.');
  }

  const client = getClient();
  const command = new GetObjectCommand({
    Bucket: POLYGON_S3_BUCKET,
    Key: objectKey,
  });

  return client.send(command);
}

async function previewFlatFile({ objectKey, maxLines = 10 }) {
  const response = await streamFlatFile({ objectKey });
  const isCompressed = objectKey.endsWith('.gz');
  const stream = isCompressed ? response.Body.pipe(createGunzip()) : response.Body;
  const reader = readline.createInterface({ input: stream, crlfDelay: Infinity });

  const lines = [];
  let count = 0;

  try {
    for await (const line of reader) {
      lines.push(line);
      count += 1;
      if (lines.length >= maxLines) {
        reader.close();
        if (stream.destroy) {
          stream.destroy();
        }
        break;
      }
    }
  } finally {
    // If the stream is still open, ensure it is closed when finished reading.
    if (stream.destroy) {
      stream.destroy();
    }
  }

  return {
    objectKey,
    totalLinesRead: count,
    sample: lines,
    compressed: isCompressed,
  };
}

async function ensureDirectory(dirPath) {
  await fsp.mkdir(dirPath, { recursive: true });
}

async function downloadFlatFile({ objectKey, destinationDir = path.join(__dirname, '..', 'uploads', 'flatfiles') }) {
  await ensureDirectory(destinationDir);
  const filename = path.basename(objectKey);
  const destinationPath = path.join(destinationDir, filename);

  const response = await streamFlatFile({ objectKey });
  await pipeline(response.Body, createWriteStream(destinationPath));

  return { destinationPath, filename };
}

async function extractIfNeeded(filePath) {
  if (!filePath.endsWith('.gz')) {
    return { extractedPath: null, rows: null };
  }

  const extractedPath = filePath.replace(/\.gz$/, '');
  await pipeline(fs.createReadStream(filePath), createGunzip(), createWriteStream(extractedPath));

  let rows = 0;
  const reader = readline.createInterface({ input: fs.createReadStream(extractedPath), crlfDelay: Infinity });
  for await (const _line of reader) {
    rows += 1;
  }
  reader.close();

  return { extractedPath, rows };
}

async function importFlatFile({ objectKey, destinationDir }) {
  const downloadResult = await downloadFlatFile({ objectKey, destinationDir });
  const extraction = await extractIfNeeded(downloadResult.destinationPath);

  return {
    objectKey,
    savedTo: downloadResult.destinationPath,
    extractedPath: extraction.extractedPath,
    rowCount: extraction.rows,
  };
}

module.exports = {
  listFlatFiles,
  getFlatFileDownloadUrl,
  previewFlatFile,
  downloadFlatFile,
  importFlatFile,
};