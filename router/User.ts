import { Router } from "express";

import { auth } from "../MiddleWare/authentication";
import User from "../MiddleWare/user";
import { Role } from "../types/enum";

const router = Router();
const user = new User();

router.post("/login", user.login); //로그인 토큰 반환

router.get("/collections/my", auth(Role.User), user.getCollection); //아이디 체크
router.post("/collections/my/:cId", auth(Role.User), user.addCollection); //컬렉션 추가

router.get("/users", auth(Role.Admin), user.getAll); //모든 유저 정보를 가져옴  admin 권한
router.get("/users/my", auth(Role.User), user.getMyInfo); //자신의 정보 얻어오기
router.get("/users/:uId", auth(Role.Admin), user.get)
router.post("/users", user.add); //회원 가입

router.get("/rooms/my", auth(Role.User), user.getMyRoom); //방 가져오기
router.post("/rooms", auth(Role.User), user.addNewRoom); //방 만들기
router.put("/rooms/my/:seq", auth(Role.User), user.updateRoom); //방 정보 업데이트

export default router;
