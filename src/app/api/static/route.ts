import { verifyToken } from "@/utils/jwt";
import { ResponseUtil } from "@/utils/response";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    try {
        const user = await verifyToken(request);
        if (!user) {
            return NextResponse.json(
                ResponseUtil.error('未授权访问'),
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const month = searchParams.get('month'); // 格式: 2022-09

        // 验证月份参数
        if (!month) {
            return NextResponse.json(
                ResponseUtil.error('缺少月份参数，格式应为: YYYY-MM'),
                { status: 400 }
            );
        }

        // 验证月份格式
        const monthRegex = /^\d{4}-\d{2}$/;
        if (!monthRegex.test(month)) {
            return NextResponse.json(
                ResponseUtil.error('月份格式错误，应为: YYYY-MM'),
                { status: 400 }
            );
        }

        // 解析年月
        const [year, monthNum] = month.split('-').map(Number);

        // 构建查询的开始和结束日期
        const startDate = new Date(year, monthNum - 1, 1); // 月份从0开始
        const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999); // 该月最后一天的最后时刻

        // 查询该月的所有支出
        const expenses = await prisma.expense.findMany({
            where: {
                userId: user.userId,
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                category: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // 计算统计数据
        const totalAmount = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
        const totalCount = expenses.length;

        // 按分类统计
        const categoryStats = expenses.reduce((stats: any, expense) => {
            const categoryName = expense.category?.name || '未分类';
            const categoryIcon = expense.category?.icon || '📝';

            if (!stats[categoryName]) {
                stats[categoryName] = {
                    name: categoryName,
                    icon: categoryIcon,
                    amount: 0,
                    count: 0,
                    expenses: []
                };
            }

            stats[categoryName].amount += Number(expense.amount);
            stats[categoryName].count += 1;
            stats[categoryName].expenses.push({
                id: expense.id,
                amount: Number(expense.amount),
                description: expense.description,
                date: expense.createdAt,
                rawText: expense.rawText
            });

            return stats;
        }, {});

        // 转换为数组并按金额排序
        const categoryList = Object.values(categoryStats).sort((a: any, b: any) => b.amount - a.amount);

        // 按日期统计（每日支出）
        const dailyStats = expenses.reduce((stats: any, expense) => {
            const date = expense.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD

            if (!stats[date]) {
                stats[date] = {
                    date,
                    amount: 0,
                    count: 0
                };
            }

            stats[date].amount += Number(expense.amount);
            stats[date].count += 1;

            return stats;
        }, {});

        // 转换为数组并按日期排序
        const dailyList = Object.values(dailyStats).sort((a: any, b: any) => a.date.localeCompare(b.date));

        return NextResponse.json(
            ResponseUtil.success({
                month,
                summary: {
                    totalAmount,
                    totalCount,
                    averageDaily: totalCount > 0 ? (totalAmount / new Date(year, monthNum, 0).getDate()).toFixed(2) : 0
                },
                categoryStats: categoryList,
                dailyStats: dailyList,
                expenses: expenses.map(expense => ({
                    id: expense.id,
                    amount: Number(expense.amount),
                    description: expense.description,
                    category: {
                        id: expense.category?.id,
                        name: expense.category?.name,
                        icon: expense.category?.icon
                    },
                    date: expense.createdAt,
                    rawText: expense.rawText,
                    aiMerchant: expense.aiMerchant,
                    aiConfidence: expense.aiConfidence
                }))
            })
        );

    } catch (error: any) {
        console.error('获取月度支出统计失败:', error);
        return NextResponse.json(
            ResponseUtil.error('服务器内部错误'),
            { status: 500 }
        );
    }
}