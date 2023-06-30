import { Router } from "express";

import { auth } from "../MiddleWare/authentication";
import { uploadImg } from "../MiddleWare/upload";

import Recipe from "../MiddleWare/recipe";
import { Role } from "../types/enum";

const router = Router();
const recipe = new Recipe();




router.get("/recipes", recipe.getAll); //모든 레시피 데이터 가져오기 LIMIT 추가 예정.
router.get("/recipes/:seq", recipe.get); //레시피 데이터
router.post("/recipes", auth(Role.Admin), uploadImg, recipe.upload); //레시피 업로드
router.get("/recipes/search", recipe.search); //검색

router.get("/recipes/details/:recipeName", recipe.getDetail); //상세 설명 가져오기
router.post("/recipes/details/:recipeName", auth(Role.Admin), recipe.addDetail); //상세 설명 추가


export default router;
