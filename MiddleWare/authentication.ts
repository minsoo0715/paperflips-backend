import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import Exception from "../Exception";
import { secretObj } from "../config/jwt"; //jwt 비밀키
import { Role } from "../types/enum";
import { jwtPayLoad } from "../types/interface";

function getPayloadWithVerify(request: Request) {
  const token: string = request.cookies.user;
  try {
    return jwt.verify(token, secretObj.secret) as jwtPayLoad;
  } catch (e) {
    throw new Exception("로그인이 필요합니다.", 401);
  }
}

export function auth(role: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    const payload = getPayloadWithVerify(req);
    res.locals.id = payload.id;

    if (role == Role.Admin && !payload.admin) {
      throw new Exception("권한이 없습니다.", 403);
    }

    next();
  };
}
