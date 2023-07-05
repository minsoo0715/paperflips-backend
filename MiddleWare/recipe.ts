import { NextFunction, Request, Response } from "express";
import { Connection, MysqlError, OkPacket } from "mysql"; //mysql 모듈
import path from "path";
import Exception from "../Exception";
import {
  AllRecipeJSON,
  FileJSON,
  RecipeDetail,
  RecipeJSON,
} from "../types/interface";
import { S3_server } from "../util/S3";
import { connection } from "../util/mysql";
import { validate_str, validate_url } from "../util/validation";

export default class Recipe {
  connection: Connection;

  constructor() {
    this.connection = connection;
  }

  getRecipe = (req: Request, res: Response, next: NextFunction) => {
    const seq: string = req.params.seq;

    if (!validate_str(seq)) {
      throw new Exception("요청 파라미터 형식을 다시 확인해주세요.", 400);
    }

    this.connection.query(
      "SELECT recipeName, rarity, summary FROM Recipe WHERE seq = ?",
      [seq],
      (error: MysqlError | null, rows: any) => {
        if (error) {
          next(error);
          return;
        }
        if (!rows.length) {
          next(new Exception("해당 레시피가 존재하지 않습니다.", 404));
          return;
        }

        const recipe: RecipeJSON = rows[0];
        res.status(200).send(recipe);
      }
    );
  };

  uploadRecipe = (req: Request, res: Response, next: NextFunction) => {
    const host: string = `https://paperflips.s3.amazonaws.com`;

    const data: RecipeJSON = {
      recipeName: req.body.recipeName,
      rarity: req.body.rarity,
      summary: req.body.summary,
    };

    if (!validate_str(data.recipeName, data.rarity, data.summary)) {
      throw new Exception("요청 바디 형식을 다시 확인해주세요.", 400);
    }

    this.connection.query(
      "INSERT INTO Recipe (recipeName, rarity, summary) VALUES (?, ?, ?)",
      [data.recipeName, data.rarity, data.summary],
      (error: MysqlError | null, packet: OkPacket) => {
        if (error) {
          next(error);
          return;
        }
        const seq: number = packet.insertId;
        const result: FileJSON = {
          originalname: req.file.originalname,
          size: req.file.size,
        };

        const image_server = new S3_server();
        image_server.recipe_upload(seq, result.originalname);
        this.connection.query(
          "UPDATE Recipe SET path = ? WHERE seq = ?",
          [
            `${host}/recipe_img/${seq}${path.extname(req.file.originalname)}`,
            seq,
          ],
          (error: MysqlError | null, result: OkPacket) => {
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

  searchRecipes = (req: Request, res: Response, next: NextFunction) => {
    const query: any = req.query.q;

    if (validate_str(query)) {
      throw new Exception("요청 파라미터 형식을 다시 확인해주세요.", 400);
    }

    this.connection.query(
      "SELECT seq, recipeName, rarity, summary from Recipe WHERE recipeName LIKE %?%",
      [query],
      (error: MysqlError | null, rows: any) => {
        if (error) {
          next(error);
          return;
        }

        res.status(200).send({
          data: rows,
          length: rows.length,
        });
      }
    );
  };

  getRecipes = (req: Request, res: Response, next: NextFunction) => {
    this.connection.query(
      "SELECT seq, recipeName, rarity, summary, path FROM Recipe",
      (error: MysqlError, rows: any) => {
        if (error) {
          next(error);
          return;
        }
        const data: AllRecipeJSON = rows;
        res.status(200).send({
          data,
          length: rows.length,
        });
      }
    );
  };

  addDetail = (req: Request, res: Response, next: NextFunction) => {
    const data: RecipeDetail = {
      recipeName: req.params.recipeName,
      detail: req.body.detail,
      VidPath: req.body.VidPath,
      ImgPath: req.body.ImgPath,
    };

    if (
      !validate_str(data.recipeName, data.detail) ||
      !validate_url(data.VidPath, data.ImgPath)
    ) {
      throw new Exception("요청 바디 형식을 다시 확인해주세요.", 400);
    }

    this.connection.query(
      "INSERT INTO Recipe_Detail (recipeName, detail, VidPath, ImgPath) VALUES (?, ?, ?, ?)",
      [data.recipeName, data.detail, data.VidPath, data.ImgPath],
      (error: MysqlError | null, packet: OkPacket) => {
        if (error) {
          next(error);
          return;
        }

        res.status(200).end();
      }
    );
  };

  getDetail = (req: Request, res: Response, next: NextFunction) => {
    const recipeName: string = req.params.recipeName;

    if (!validate_str(recipeName)) {
      throw new Exception("요청 파라미터 형식을 다시 확인해주세요.", 400);
    }

    this.connection.query(
      "SELECT * FROM Recipe_Detail WHERE recipeName = ?",
      [recipeName],
      (error: MysqlError | null, rows: any) => {
        if (error) {
          next(error);
          return;
        }

        res.status(200).send(rows[0]);
      }
    );
  };
}
