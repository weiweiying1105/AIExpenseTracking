/*
 * @Author: your name
 * @Date: 2025-08-19 14:36:41
 * @LastEditTime: 2025-09-01 17:18:12
 * @LastEditors: 韦玮莹
 * @Description: In User Settings Edit
 * @FilePath: \AIExpenseTracking\ai-accounting-server\src\app\api\auth\login\route.ts
 */
import { Response, Request } from "express";


import { PrismaClient } from "@prisma/client";
const APPID = process.env.WECHAT_APP_ID;
const SECRET = process.env.WECHAT_APP_SECRET;
import { ResponseUtil, ResponseCode } from "@/utils/response";
import axios from "axios";

const prisma = new PrismaClient();

// 定义一个异步函数，用于处理用户登录请求
export const wxLogin = async (req: Request, res: Response) => {
  try {
    // 从请求体中获取code
    const { code } = req.body;
    if (!code) {
      return res.json({ message: '没有code' }, { status: 400 })
    } else {
      const response = await axios.get(`https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${SECRET}&js_code=${code}&grant_type=authorization_code`);
      console.log('调微信登录接口的结果:', response.data);

      const { openid, session_key, errcode, errmsg } = response.data;
      if (errcode || !openid) {
        return res.status(400).json(
          ResponseUtil.wechatApiError(errmsg || '微信登录失败'),
        );
      }
      let _user = await prisma.user.findUnique({
        where: { openid }
      })
      if (!_user) {
        // 新用户
        _user = prisma.user.create({
          data: {
            openid,
            session_key
          }
        })
      } else {
        // 更新session_key
        _user = prisma.user.update({
          where: { openid },
          data: {
            lastLoginAt: new Date(),
          }
        })
      }
      return res.status(200).json(ResponseUtil.success(_user))
    }
  } catch (e) {
    res.status(500).json(ResponseUtil.error(e))
  }

}