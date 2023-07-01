import { NextFunction, Request, Response } from "express";
import { Connection, MysqlError, OkPacket } from "mysql"; //mysql 모듈
import path from "path";
import {
  AllRecipeJSON,
  FileJSON,
  RecipeDetail,
  RecipeJSON,
} from "../types/interface";
import { S3_server } from "../util/S3";
import { logs_ } from "../util/botLogger";
import { connection } from "../util/mysql";
import { check_name, check_number } from "../util/validation";

export default class Recipe {
  connection: Connection;

  constructor() {
    this.connection = connection;
  }

  getRecipe = (req: Request, res: Response, next: NextFunction) => {
    const seq: string = req.params.seq;

    if (!check_number(seq)) {
      res.status(404).end();
      return;
    }
    try {
      this.connection.query(
        "SELECT recipeName, rarity, summary FROM Recipe WHERE seq = ?",
        [seq],
        (error: MysqlError | null, rows: any) => {
          if (error) {
            logs_(error.toString());
            res.status(404).end();
            return;
          }

          const recipe: RecipeJSON = rows[0];
          res.status(200).send(recipe);
          return;
        }
      );
    } catch (e) {
      logs_(e as string);
      res.status(404).end();
      return;
    }
  };

  uploadRecipe = (req: Request, res: Response, next: NextFunction) => {
    const host: string = `https://paperflips.s3.amazonaws.com`;

    const data: RecipeJSON = {
      //업로드 데이터
      recipeName: req.body.recipeName,
      rarity: req.body.rarity,
      summary: req.body.summary,
    };
    if (
      !check_name(data.recipeName) ||
      !check_name(data.rarity) ||
      !check_name(data.summary)
    ) {
      res.status(404).end();
      return;
    }

    this.connection.query(
      "INSERT INTO Recipe (recipeName, rarity, summary) VALUES (?, ?, ?)",
      [data.recipeName, data.rarity, data.summary],
      (error: MysqlError | null, rows: OkPacket) => {
        if (error) {
          //sql error 발생.. connection.on으로 에러 핸들링 예정
          logs_(error.toString());
          res.status(404).end();
          return;
        }
        const seq: number = rows.insertId;
        const result: FileJSON = {
          //업로드 파일 관련 메타데이터
          originalname: req.file.originalname,
          size: req.file.size,
        };

        const image_server = new S3_server();
        image_server.recipe_upload(seq, result.originalname); //recipe_img 디렉토리에 파일을 업로드 함..
        this.connection.query("UPDATE Recipe SET path = ? WHERE seq = ?", [
          `${host}/recipe_img/${seq}${path.extname(req.file.originalname)}`,
          seq,
        ]); //업로드 한 파일의 s3 경로를 받아옴
        res.status(200).end(); //성공
        return;
      }
    );
  };

  searchRecipes = (req: Request, res: Response, next: NextFunction) => {
    const recipe: any = req.query.q;

    if (!check_name(recipe)) {
      res.status(404).end(); //SQL INJECTION 방지를 위한 정규식 체크
      return;
    }

    try {
      this.connection.query(
        "SELECT seq, recipeName, rarity, summary from Recipe WHERE recipeName LIKE %?%",
        [recipe],
        (error: MysqlError | null, rows: any) => {
          //LIKE를 이용해 검색
          if (error) {
            //에러 발생
            logs_(error.toString());
            res.status(404).end(); //404
            return;
          }
          if (rows.length == 0) {
            res.status(404).end(); //404
            return;
          }

          res.status(200).send({
            data: rows,
            length: rows.length,
          });
          return;
        }
      );
    } catch (e) {
      logs_(e as string);
      res.status(404).end(); // 실패, 에러
      return;
    }
  };

  getRecipes = (req: Request, res: Response, next: NextFunction) => {
    try {
      this.connection.query(
        "SELECT seq, recipeName, rarity, summary, path FROM Recipe",
        (error: MysqlError, rows: any) => {
          //쿼리
          if (error) {
            // 에러
            logs_(error.toString());

            res.status(404).end(); // 실패
            return;
          }
          const data: AllRecipeJSON = rows;
          res.status(200).send({
            data,
            length: rows.length,
          });
        }
      );
    } catch (e) {
      logs_(e as string);
      res.status(404).end(); //실패 , 에러
      return;
    }
  };

  addDetail = (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: RecipeDetail = {
        recipeName: req.params.recipeName,
        detail: req.body.detail,
        VidPath: req.body.VidPath,
        ImgPath: req.body.ImgPath,
      };
      this.connection.query(
        "INSERT INTO Recipe_Detail (recipeName, detail, VidPath, ImgPath) VALUES (?, ?, ?, ?)",
        [data.recipeName, data.detail, data.VidPath, data.ImgPath]
      );
      res.status(200).end();
    } catch (e) {
      logs_(e as string);
      res.status(404).end();
      return;
    }
  };

  getDetail = (req: Request, res: Response, next: NextFunction) => {
    try {
      this.connection.query(
        "SELECT * FROM Recipe_Detail WHERE recipeName = ?",
        [req.params.recipeName],
        (error: MysqlError | null, rows: any) => {
          res.status(200).send(rows[0]);
          return;
        }
      );
    } catch (e) {
      logs_(e as string);
      res.status(404).end();
    }
  };
}
