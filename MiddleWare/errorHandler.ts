import { NextFunction, Request, Response } from "express";
import { MysqlError } from "mysql";
import { logs_http } from "../util/botLogger";
import Exception from "../Exception";

export default function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let error_msg: string = "오류가 발생했습니다. 관리자에게 문의하세요";

  if(err.name === "Exception") {
    res.status((err as Exception).status)
    error_msg = err.message;
  }else {
    res.status(500);
    logs_http(err.message);
  }

  res.send({message: error_msg}).end();
}
