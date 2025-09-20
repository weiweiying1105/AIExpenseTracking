// 支出匹配模式定义
export interface ExpensePattern {
    regex: RegExp;
    category: string;
    getResult: (match: RegExpMatchArray) => {
        amount: number;
        description: string;
        tags: string[];
        confidence: number;
    };
}

// 常见支出模式
export const expensePatterns: ExpensePattern[] = [
    // 模式1: "午饭30元" "晚餐50" "早餐15块"
    {
        regex: /^(早餐|午餐|午饭|晚餐|晚饭|夜宵)\s*(\d+(?:\.\d+)?)\s*[元块钱]?$/,
        category: '餐饮',
        getResult: (match: RegExpMatchArray) => ({
            amount: parseFloat(match[2]),
            description: match[1],
            tags: [match[1], '餐饮'],
            confidence: 0.95
        })
    },
    // 模式2: "打车15元" "滴滴20" "出租车30" "共享单车5元"
    {
        regex: /^(打车|滴滴|出租车|网约车|地铁|公交|交通|共享单车|单车|摩拜|哈啰|青桔|美团单车|ofo)\s*(\d+(?:\.\d+)?)\s*[元块钱]?$/,
        category: '交通',
        getResult: (match: RegExpMatchArray) => ({
            amount: parseFloat(match[2]),
            description: match[1].includes('单车') || ['摩拜', '哈啰', '青桔', '美团单车', 'ofo'].includes(match[1]) ? '共享单车' : match[1],
            tags: [match[1].includes('单车') || ['摩拜', '哈啰', '青桔', '美团单车', 'ofo'].includes(match[1]) ? '共享单车' : match[1], '交通'],
            confidence: 0.9
        })
    },
    // 模式3: "咖啡25" "奶茶18" "星巴克35"
    {
        regex: /^(咖啡|奶茶|饮料|可乐|果汁|星巴克|瑞幸)\s*(\d+(?:\.\d+)?)\s*[元块钱]?$/,
        category: '餐饮',
        getResult: (match: RegExpMatchArray) => ({
            amount: parseFloat(match[2]),
            description: match[1],
            tags: [match[1], '饮品'],
            confidence: 0.9
        })
    },
    // 模式4: "超市购物100" "买菜50" "水果30"
    {
        regex: /^(超市|买菜|水果|蔬菜|购物|日用品)\s*(\d+(?:\.\d+)?)\s*[元块钱]?$/,
        category: '购物',
        getResult: (match: RegExpMatchArray) => ({
            amount: parseFloat(match[2]),
            description: match[1],
            tags: [match[1], '生活用品'],
            confidence: 0.85
        })
    },
    // 模式5: "加油200" "油费150"
    {
        regex: /^(加油|油费|汽油)\s*(\d+(?:\.\d+)?)\s*[元块钱]?$/,
        category: '交通',
        getResult: (match: RegExpMatchArray) => ({
            amount: parseFloat(match[2]),
            description: '加油',
            tags: ['加油', '汽车'],
            confidence: 0.95
        })
    },
    // 模式6: "电影票45" "看电影60"
    {
        regex: /^(电影|看电影|电影票|娱乐)\s*(\d+(?:\.\d+)?)\s*[元块钱]?$/,
        category: '娱乐',
        getResult: (match: RegExpMatchArray) => ({
            amount: parseFloat(match[2]),
            description: '电影',
            tags: ['电影', '娱乐'],
            confidence: 0.9
        })
    },
    // 模式7: "彩票10元" "买彩票20" "福利彩票50"
    {
        regex: /^(彩票|买彩票|福利彩票|体育彩票|刮刮乐|双色球|大乐透)\s*(\d+(?:\.\d+)?)\s*[元块钱]?$/,
        category: '娱乐',
        getResult: (match: RegExpMatchArray) => ({
            amount: parseFloat(match[2]),
            description: '彩票',
            tags: ['彩票', '娱乐'],
            confidence: 0.95
        })
    }
];

// 定义分类接口
interface Category {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    icon: string | null;
    color: string | null;
    type: string;
    isDefault: boolean;
    sortOrder: number;
    userId: string | null;
}

// 快速分析支出的工具函数
export function quickAnalyzeExpense(rawText: string, availableCategories: Category[]) {
    const text = rawText.trim();

    // 尝试匹配模式
    for (const pattern of expensePatterns) {
        const match = text.match(pattern.regex);
        if (match) {
            const result = pattern.getResult(match);

            // 查找对应的分类ID
            const category = availableCategories.find(c =>
                c.name.includes(pattern.category) ||
                c.name === pattern.category
            );

            return {
                success: true,
                data: {
                    ...result,
                    categoryId: category?.id || null,
                    merchant: null,
                    reasoning: `通过正则匹配识别为${pattern.category}支出`,
                    isExpense: true
                },
                isQuickMatch: true
            };
        }
    }

    return { success: false, isQuickMatch: false };
}