import crypto from "crypto";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { MysqlError, OkPacket } from "mysql"; // mysql 모듈
import { secretObj } from "../config/jwt"; // jwt 비밀키
import {
  CollectionJSONArray,
  RoomJSON,
  UserJSON,
  loginJSON,
  registerJSON,
} from "../types/interface";
import { isAdmin } from "../util/admin"; // admin 판단을 위함
import { check_id, check_name, check_pwd } from "../util/validation"; // 정규식 체크

import moment from "moment";
import "moment-timezone";
import Exception from "../Exception";
import { connection } from "../util/mysql";

moment.tz.setDefault("Asia/Seoul");

export default class User {
  connection;

  constructor() {
    this.connection = connection;
  }

  getUsers = (req: Request, res: Response, next: NextFunction) => {
    this.connection.query(
      "SELECT id, name, password, intro, favorite, deleted_day FROM Users",
      (error: MysqlError, rows: any) => {
        if (error) {
          next(error);
          return;
        }
        res.status(200).send(rows);
      }
    );
  };

  getUser = (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.uId;

    this.connection.query(
      "SELECT id, name, password, intro, favorite, deleted_day FROM Users WHERE id = ?",
      [userId],
      (error: MysqlError | null, rows: any) => {
        if (error) {
          next(error);
          return;
        }
        res.status(200).send(rows[0]);
      }
    );
  };

  login = (req: Request, res: Response, next: NextFunction) => {
    const data: loginJSON = {
      id: req.body.id,
      pwd: req.body.password,
    };

    if (!check_id(data.id) || !check_pwd(data.pwd)) {
      next(new Exception("요청 바디 형식을 다시 확인해주세요.", 400));
      return;
    }
    try {
      this.connection.query(
        "SELECT password, salt, name, intro, favorite, deleted_day FROM Users WHERE id = ?",
        [data.id],
        (error: MysqlError | null, rows: any[]) => {
          if (error) {
            next(error);
            return;
          }
          if (!rows.length) {
            next(new Exception("로그인에 실패하였습니다.", 401));
            return;
          }
          crypto.pbkdf2(
            data.pwd,
            rows[0].salt,
            126117,
            64,
            "sha512",
            (err: Error | null, key: Buffer) => {
              if (err) {
                next(err);
                return;
              }

              if (key.toString("base64") !== rows[0].password) {
                next(new Exception("로그인에 실패하였습니다.", 401));
                return;
              }

              const token: string = jwt.sign(
                {
                  id: req.body.id,
                  admin: isAdmin(req.body.id),
                },
                secretObj.secret,
                {
                  expiresIn: "30m",
                }
              );

              const data: UserJSON = {
                id: req.body.id,
                name: rows[0].name,
                intro: rows[0].intro,
                favorite: rows[0].favorite,
                deleted_day: rows[0].deleted_day,
              };

              res.cookie("user", token);

              res.status(200).send(data);
            }
          );
        }
      );
    } catch (e) {
      next(e);
    }
  };

  register = (req: Request, res: Response, next: NextFunction) => {
    const data: registerJSON = {
      id: req.body.id,
      pwd: req.body.password,
      name: req.body.name,
    };

    /// ////////정규식 체크(SQL Injection 방지)
    if (!check_id(data.id) || !check_pwd(data.pwd) || !check_name(data.name)) {
      next(new Exception("요청 바디 형식을 다시 확인해주세요.", 400));
      return;
    }

    // 32바이트의 랜덤 문자열 생성(salt)
    crypto.randomBytes(32, (err: Error | null, buf: Buffer) => {
      // salt를 이용한 pwd 암호화
      crypto.pbkdf2(
        data.pwd,
        buf.toString("base64"),
        126117,
        64,
        "sha512",
        (err: Error | null, key: Buffer) => {
          if (err) {
            next(err);
            return;
          }

          const en_pwd: string = key.toString("base64"); // 암호화한 pwd
          const salt: string = buf.toString("base64"); // 랜덤 문자열 salt

          this.connection.query(
            "INSERT INTO Users (id, password, name, salt) VALUES(?, ?, ?, ?)",
            [data.id, en_pwd, data.name, salt],
            (err: MysqlError | null, results: any) => {
              if (err) {
                next(err);
                return;
              }
              res.status(200).end();
            }
          );
        }
      );
    });
  };

  my = (req: Request, res: Response, next: NextFunction) => {
    const { id } = res.locals;

    this.connection.query(
      "SELECT id, name, intro, favorite, deleted_day FROM Users WHERE id = ?",
      [id],
      (error: MysqlError | null, rows: any) => {
        if (error) {
          next(error);
          return;
        }

        if (!rows.length || rows.deleted_day != null) {
          next(
            new Exception(
              "인증 정보가 유효하지 않습니다. 다시 로그인하세요.",
              404
            )
          );
          return;
        }

        res.status(200).send(rows);
      }
    );
  };

  getCollections = (req: Request, res: Response, next: NextFunction) => {
    const { id } = res.locals;

    this.connection.query(
      "SELECT rec.seq, rec.recipeName, rec.rarity, rec.summary, rec.path, c.Date FROM Recipe AS rec JOIN Collection AS c ON c.rec_num = rec.seq AND c.id = ?",
      [id],
      (error: MysqlError | null, rows: any) => {
        if (error) {
          next(error);
          return;
        }

        const response: CollectionJSONArray = rows;
        res.status(200).send(response);
      }
    );
  };

  addCollection = (req: Request, res: Response, next: NextFunction) => {
    const Recipe_seq: number = +req.params.cId; // 추가할 레시피 seq
    const { id } = res.locals;
    this.connection.query(
      "SELECT * FROM Collection WHERE id= ? AND rec_num= ?",
      [id, Recipe_seq],
      (error: MysqlError | null, rows: any) => {
        if (error) {
          next(error);
          return;
        }

        if (rows.length != 0) {
          next(new Exception("이미 레시피가 등록되어 있습니다.", 409));
          return;
        }
        this.connection.query(
          "INSERT INTO Collection (id, rec_num, Date) VALUES (?, ?, ?)",
          [id, Recipe_seq, moment().format("YYYY-MM-DD HH:mm:ss")],
          (error: MysqlError | null, rows: any) => {
            if (error) {
              next(error);
              return;
            }
            res.status(200).end();
          }
        );
      }
    );
  };

  addRoom = (req: Request, res: Response, next: NextFunction) => {
    const input: RoomJSON = {
      title: req.body.title,
      id: res.locals.id,
      date: moment().format("YYYY-MM-DD HH:mm:ss"),
      Data: JSON.stringify(req.body.data),
    };
    try {
      this.connection.query(
        "INSERT INTO RoomInfo (title, id, date, Data) VALUES (?, ?, ?, ?)",
        [input.title, input.id, input.date, input.Data],
        (err: MysqlError | null, rows: any) => {
          if (err) {
            next(err);
            return;
          }

          res.status(200).end();
        }
      );
    } catch (e) {
      next(e);
    }
  };

  getMyRoom = (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = res.locals;
      this.connection.query(
        "SELECT seq, title, date, Data FROM RoomInfo WHERE id = ?",
        [id],
        (err: MysqlError | null, rows: any) => {
          if (err) {
            next(err);
            return;
          }

          if (rows.length == 0) {
            next(new Exception("생성한 방이 없습니다.", 204));
            return;
          }
          const data: any = JSON.parse(JSON.stringify(rows)); // deep copy

          for (let i: number = 0; i < data.length; i++) {
            data[i].Data = JSON.parse(data[i].Data);
          }

          res.status(200).send(data);
        }
      );
    } catch (e) {
      next(e);
    }
  };

  updateRoom = (req: Request, res: Response, next: NextFunction) => {
    try {
      this.connection.query(
        "UPDATE RoomInfo SET Data = ? WHERE seq= ? AND id= ?",
        [JSON.stringify(req.body.Data), req.params.seq, res.locals.id],
        (error: MysqlError | null, rows: OkPacket) => {
          if (rows.affectedRows === 0) {
            next(new Exception("해당 방이 존재하지 않습니다.", 404));
            return;
          }
          res.status(200).end();
        }
      );
    } catch (e) {
      next(e);
    }
  };
}
