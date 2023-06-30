import express from "express";

import { auth } from "../MiddleWare/authentication";
import { bot_check } from "../MiddleWare/botcheck";
import User from "../MiddleWare/user";
import { Role } from "../types/enum";

const router = express.Router();
const user = new User();

router.get("/users", auth(Role.Admin), user.getAll); //모든 유저 정보를 가져옴  admin 권한

router.get("/GetCollection", auth(Role.User), user.getCollection); //아이디 체크

router.post("/AddCollection/:cId", auth(Role.User), user.addCollection); //컬렉션 추가

router.post("/Adduser", user.add); //회원 가입

router.get("/GetMyInfo", auth(Role.User), user.getMyInfo); //자신의 정보 얻어오기

router.get("/check", bot_check); //디코 봇 서버 체크

router.post("/login", user.login); //로그인 토큰 반환

router.post("/NewRoom", auth(Role.User), user.addNewRoom); //방 만들기

router.get("/myRoom", auth(Role.User), user.getMyRoom); //방 가져오기

router.put("/RoomDataChange/:seq", auth(Role.User), user.updateRoom); //방 정보 업데이트

export default router;
