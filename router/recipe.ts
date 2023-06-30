import { Router } from "express";

import { auth } from "../MiddleWare/authentication";
import { uploadImg } from "../MiddleWare/upload";

import Recipe from "../MiddleWare/recipe";
import { Role } from "../types/enum";

const router = Router();
const recipe = new Recipe();

router.get("/data/:seq", recipe.get); //레시피 데이터

router.post("/Upload", auth(Role.Admin), uploadImg, recipe.upload); //레시피 업로드

router.get("/Search", recipe.search); //검색

router.get("/AllData", recipe.getAll); //모든 레시피 데이터 가져오기 LIMIT 추가 예정.

router.post("/AddDetail/:recipeName", auth(Role.Admin), recipe.addDetail); //상세 설명 추가

router.get("/GetDetail/:recipeName", recipe.getDetail); //상세 설명 가져오기

export default router;
