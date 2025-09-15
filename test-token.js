const jwt = require('jsonwebtoken');

// 生成测试用的JWT token
const payload = {
    userId: 'test-user-123',
    openId: 'test-openid-123',
    nickName: 'Test User'
};

const secret = process.env.JWT_SECRET || 'your-jwt-secret-key';
const token = jwt.sign(payload, secret, { expiresIn: '24h' });

console.log('Generated JWT Token:');
console.log('Bearer ' + token);
console.log('\nYou can use this token in your API requests.');