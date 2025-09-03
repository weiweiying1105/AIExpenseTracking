/*
 * @Author: your name
 * @Date: 2025-09-01 17:04:17
 * @LastEditTime: 2025-09-01 17:08:15
 * @LastEditors: 韦玮莹
 * @Description: In User Settings Edit
 * @FilePath: \AIExpenseTracking\ai-accounting-server\utils\response.ts
 */
// 响应状态码常量
export const ResponseCode = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,

  // 业务状态码
  LOGIN_SUCCESS: 1000,
  LOGIN_FAILED: 1001,
  USER_NOT_FOUND: 1002,
  INVALID_CODE: 1003,
  WECHAT_API_ERROR: 1004,
  TOKEN_EXPIRED: 1005,
  PERMISSION_DENIED: 1006,
} as const;

// 响应消息常量
export const ResponseMessage = {
  SUCCESS: '操作成功',
  CREATED: '创建成功',
  BAD_REQUEST: '请求参数错误',
  UNAUTHORIZED: '未授权访问',
  FORBIDDEN: '禁止访问',
  NOT_FOUND: '资源不存在',
  INTERNAL_ERROR: '服务器内部错误',

  // 业务消息
  LOGIN_SUCCESS: '登录成功',
  LOGIN_FAILED: '登录失败',
  USER_NOT_FOUND: '用户不存在',
  INVALID_CODE: '无效的授权码',
  WECHAT_API_ERROR: '微信接口调用失败',
  TOKEN_EXPIRED: 'Token已过期',
  PERMISSION_DENIED: '权限不足',
} as const;

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T | null;
  timestamp?: number;
}

// 响应工具类
/**
 * 响应工具类
 * 用于处理和格式化各种API响应数据
 */
export class ResponseUtil {
  /**
   * 成功响应
   */
  static success<T = any>(data: T, message?: string): ApiResponse<T> {
    return {
      code: ResponseCode.SUCCESS,
      message: message || ResponseMessage.SUCCESS,
      data,
      timestamp: Date.now(),
    };
  }
}