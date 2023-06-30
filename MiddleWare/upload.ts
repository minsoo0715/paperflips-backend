import { Request } from "express";
import multer from "multer";

const storage: multer.StorageEngine = multer.diskStorage({
  destination: function (
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, destination: string) => void
  ) {
    callback(null, "images/");
  }, //파일 저장 위치
  filename(
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, destination: string) => void
  ) {
    callback(null, file.originalname);
  }, //파일 이름
});

const upload: multer.Multer = multer(
  //업로드 객체
  {
    storage: storage,
  }
);

export const uploadImg = () => upload.single("img");
