import { StorageBucket } from 'types/storage';
const { DATABASE_URL } = process.env;
const BASE_STORAGE_PATH = 'storage/v1/object/public';

type ImagePath = string | string[];

export const generateImageUrls = <T extends ImagePath>(
  imagePaths: T,
  bucket: StorageBucket,
): T extends string ? string : string[] => {
  const isArray = Array.isArray(imagePaths);
  if (!isArray) {
    return `${DATABASE_URL}/${BASE_STORAGE_PATH}/${bucket}/${imagePaths}?width=500&height=600` as any;
  }
  return imagePaths.map((imagePath) => {
    return `${DATABASE_URL}/${BASE_STORAGE_PATH}/${bucket}/${imagePath}?width=500&height=600

    `;
  }) as any;
};
