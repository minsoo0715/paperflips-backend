import { middleware as cache } from "apicache";
import { Router } from "express";
import { privacy, robot, root } from "../MiddleWare/etc";
import UserRouter from "./User";
import RecipeRouter from "./recipe";

const router = Router();

router.use("/User", UserRouter); //유저 관련 라우터

router.use("/rec", RecipeRouter); //레시피 관련 라우터

router.get("/privacy", cache("60 minutes"), privacy); //개인정보 취급 방침

router.get("/robots.txt", cache("60 minutes"), robot); //검색 엔진 접근 권한

router.get("/", root); // 서버 상태 확인을 위한 엔드포인트

export default router;
