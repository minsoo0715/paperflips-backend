import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { secretObj } from "../config/jwt"; //jwt 비밀키
import { Role } from "../types/enum";
import { jwtPayLoad } from "../types/interface";
import Exception from "../Exception";

function getPayloadWithVerify(request: Request) {
  const token: string = request.cookies.user;
  return jwt.verify(token, secretObj.secret) as jwtPayLoad;
}

export function auth(role: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = getPayloadWithVerify(req);
      res.locals.id = payload.id;

      if (role == Role.Admin && !payload.admin) {
        next(new Exception("권한이 없습니다.", 403));
        return;
      }
    } catch (err) {
      next(new Exception("로그인이 필요합니다.", 401));
      return;
    }

    next();
  };
}
