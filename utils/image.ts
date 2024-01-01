import { StorageBucket } from '@type/storage';

const { DATABASE_URL } = process.env;
const BASE_STORAGE_PATH = 'storage/v1/object/public';

type ImagePath = string | string[];

const getFullPath = (imagePath: string, bucket: StorageBucket) => {
  return `${DATABASE_URL}/${BASE_STORAGE_PATH}/${bucket}/${imagePath}?width=400&height=400`;
};

export const generateImageUrls = <T extends ImagePath>(
  imagePaths: T,
  bucket: StorageBucket,
): T extends string ? string : string[] => {
  const isArray = Array.isArray(imagePaths);
  if (!isArray) {
    return getFullPath(imagePaths as string, bucket) as any;
  }
  return imagePaths.map((imagePath) => {
    return getFullPath(imagePath, bucket);
  }) as any;
};
