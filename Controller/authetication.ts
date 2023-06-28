import express from "express";
import jwt from "jsonwebtoken";
import { secretObj } from "../config/jwt"; //jwt 비밀키
import { jwtPayLoad } from "../interface";

export function auth(requiresAdmin: boolean) {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const token: string = req.cookies.user;
      const payload = jwt.verify(token, secretObj.secret) as jwtPayLoad; //토큰 검증

      res.locals.id = payload.id;

      if (requiresAdmin && !payload.admin) {
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
