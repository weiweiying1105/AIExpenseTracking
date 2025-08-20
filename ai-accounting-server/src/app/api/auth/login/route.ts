/*
 * @Author: your name
 * @Date: 2025-08-19 14:36:41
 * @LastEditTime: 2025-08-19 16:00:44
 * @LastEditors: 韦玮莹
 * @Description: In User Settings Edit
 * @FilePath: \AIExpenseTracking\ai-accounting-server\src\app\api\auth\login\route.ts
 */
import { NextRequest, NextResponse } from "next/server";

import { PrismaClient } from "@prisma/client";

import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { code, usrInfo } = await request.json();
    if (!code) {
      return NextResponse.json({ message: 'code不能为空' }, { status: 500 });
    }

    // 调用微信API获取openid
    const wxResponse = await fetch(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${process.env.WECHAT_APP_ID}&secret=${process.env.WECHAT_APP_SECRET}&js_code=${code}&grant_type=authorization_code`
    )
    const wxData = await wxResponse.json();


    if (wxData.errcode) {
      return NextResponse.json(
        { error: '微信登录失败', details: wxData.errmsg },
        { status: 400 }
      )
    }

    const { openid, unionid, session_key } = wxData;
    
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}