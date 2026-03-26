import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectCommand,
  CopyObjectCommand,
  GetObjectCommand,
  type _Object,
  type CommonPrefix,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { AwsCredentials } from "../store/credentials";

export interface S3Item {
  key: string;
  size?: number;
  lastModified?: Date;
  isFolder: boolean;
}

function buildClient(creds: AwsCredentials): S3Client {
  return new S3Client({
    region: creds.region,
    credentials: {
      accessKeyId: creds.accessKeyId,
      secretAccessKey: creds.secretAccessKey,
    },
  });
}

export async function listObjects(
  creds: AwsCredentials,
  prefix: string = ""
): Promise<S3Item[]> {
  const client = buildClient(creds);
  const command = new ListObjectsV2Command({
    Bucket: creds.bucket,
    Prefix: prefix,
    Delimiter: "/",
  });
  const response = await client.send(command);
  const folders: S3Item[] = (response.CommonPrefixes ?? []).map(
    (p: CommonPrefix) => ({
      key: p.Prefix ?? "",
      isFolder: true,
    })
  );
  const files: S3Item[] = (response.Contents ?? [])
    .filter((obj: _Object) => obj.Key !== prefix)
    .map((obj: _Object) => ({
      key: obj.Key ?? "",
      size: obj.Size,
      lastModified: obj.LastModified,
      isFolder: false,
    }));
  return [...folders, ...files];
}

export async function uploadFile(
  creds: AwsCredentials,
  prefix: string,
  file: File
): Promise<void> {
  const client = buildClient(creds);
  const key = prefix + file.name;
  const upload = new Upload({
    client,
    params: {
      Bucket: creds.bucket,
      Key: key,
      Body: file,
      ContentType: file.type || "application/octet-stream",
    },
  });
  await upload.done();
}

export async function deleteObject(
  creds: AwsCredentials,
  key: string
): Promise<void> {
  const client = buildClient(creds);
  await client.send(
    new DeleteObjectCommand({ Bucket: creds.bucket, Key: key })
  );
}

export async function moveObject(
  creds: AwsCredentials,
  sourceKey: string,
  destinationKey: string
): Promise<void> {
  const client = buildClient(creds);
  await client.send(
    new CopyObjectCommand({
      Bucket: creds.bucket,
      CopySource: `${encodeURIComponent(creds.bucket)}/${sourceKey.split("/").map(encodeURIComponent).join("/")}`,
      Key: destinationKey,
    })
  );
  await client.send(
    new DeleteObjectCommand({ Bucket: creds.bucket, Key: sourceKey })
  );
}

export async function getDownloadUrl(
  creds: AwsCredentials,
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const client = buildClient(creds);
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: creds.bucket, Key: key }),
    { expiresIn }
  );
}
