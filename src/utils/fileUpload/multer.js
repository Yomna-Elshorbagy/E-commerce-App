import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from "uuid";
import multer from "multer";
import { AppError } from '../catchError.js';

const fileValidation = {
  images: ["image/jpg", "image/jpeg", "image/png", "image/gif", "image/bmp", "image/webp", "image/tiff"],
  document: ['application/pdf','application/msword','application/rtf', 'text/plain', 'text/csv',],
  videos: ['video/mp4', 'video/x-msvideo', 'video/x-matroska', 'video/webm', 'video/quicktime', 'video/x-ms-wmv']
}
export const fileUpload = (folderName , allowFile = fileValidation.images) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const fullpath = path.resolve(`uploads/${folderName}`);
      if (!fs.existsSync(fullpath)) {
        fs.mkdirSync(fullpath , {recursive: true});
      }
      cb(null, `uploads/${folderName}`);
    },
    filename: (req, file, cb) => {
      const sanitizedFileName = file.originalname.replace(/\s+/g, '_'); //remove any space
      cb(null, uuidv4() + "_" + sanitizedFileName);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (allowFile.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError("image only"), false);
    }
  }

  const upload = multer({
    storage ,
    fileFilter,
    limits: {
      fieldSize: 10* 1024 * 1024, 
    },
  });
  return upload;
};

export const uploadSingleFile = (fieldName, folderName) => {
  return fileUpload(folderName).single(fieldName);
};

export const uploadMixFiles = (arrayOfFields, folderName) => {
  return fileUpload(folderName).fields(arrayOfFields);
};

export const uploadMixFile = (fieldName, maxCount,folderName) => {
  return fileUpload(folderName).array(fieldName, maxCount, folderName);
};
