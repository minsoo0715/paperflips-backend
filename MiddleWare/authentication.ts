import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { secretObj } from "../config/jwt"; //jwt 비밀키
import { jwtPayLoad } from "../interface";
import { Role } from "../enum";


function getPayloadWithVerify(request: Request) {
  const token: string = request.cookies.user;
  return jwt.verify(token, secretObj.secret) as jwtPayLoad;
}


export function auth(role: Role) {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const payload = getPayloadWithVerify(req);
      res.locals.id = payload.id;

      if (role == Role.Admin && !payload.admin) {
          res.status(403).end();
          return;
      }

    } catch (err) {
      res.status(401).end();
      return;
    }

    next();
  };
}
