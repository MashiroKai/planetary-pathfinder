// ===== OpenClaw 控制接口 =====
// 用于飞书机器人调用管理后台

const express = require('express');
const crypto = require('crypto');
const router = express.Router();

// 模拟数据库
let applications = [];
let admins = [{ username: 'admin', password: hash('admin123'), createdAt: new Date().toISOString() }];

// 密码加密
function hash(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// 验证 token
function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    if (!token || token !== process.env.OPENCLAW_TOKEN) {
        return res.status(401).json({ success: false, message: '未授权' });
    }
    next();
}

// OpenClaw  webhook 接口
router.post('/openclaw/webhook', verifyToken, async (req, res) => {
    const { action, params } = req.body;
    
    try {
        switch (action) {
            case 'get_applications':
                // 获取所有报名申请
                res.json({
                    success: true,
                    data: applications,
                    count: applications.length
                });
                break;
                
            case 'get_stats':
                // 获取统计数据
                const today = new Date().toDateString();
                const todayCount = applications.filter(a => 
                    new Date(a.submitTime).toDateString() === today
                ).length;
                
                res.json({
                    success: true,
                    data: {
                        total: applications.length,
                        today: todayCount,
                        admins: admins.length
                    }
                });
                break;
                
            case 'export_data':
                // 导出数据
                res.json({
                    success: true,
                    data: applications,
                    format: 'json',
                    downloadUrl: '/api/openclaw/download'
                });
                break;
                
            case 'add_admin':
                // 添加管理员
                const { username, password } = params;
                if (!username || !password) {
                    return res.json({ success: false, message: '缺少用户名或密码' });
                }
                
                const exists = admins.find(a => a.username === username);
                if (exists) {
                    return res.json({ success: false, message: '用户名已存在' });
                }
                
                admins.push({
                    username,
                    password: hash(password),
                    createdAt: new Date().toISOString()
                });
                
                res.json({
                    success: true,
                    message: `管理员 "${username}" 添加成功`
                });
                break;
                
            case 'list_admins':
                // 列出管理员
                res.json({
                    success: true,
                    data: admins.map(a => ({ username: a.username, createdAt: a.createdAt }))
                });
                break;
                
            case 'summary':
                // 总结数据
                const summary = generateSummary(applications);
                res.json({
                    success: true,
                    summary: summary
                });
                break;
                
            default:
                res.json({
                    success: false,
                    message: `未知操作：${action}`
                });
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

// 数据下载接口
router.get('/download', (req, res) => {
    let csv = '\uFEFF 姓名，性别，学院，专业，年级，学号，邮箱，手机，技能特长，申请理由，提交时间\n';
    
    applications.forEach(app => {
        csv += `"${app.name || ''}","${app.gender || ''}","${app.college || ''}","${app.major || ''}","${app.grade || ''}","${app.studentId || ''}","${app.email || ''}","${app.phone || ''}","${(app.skills || '').replace(/"/g, '""')}","${(app.motivation || '').replace(/"/g, '""')}","${app.submitTime || ''}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv;charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=报名数据_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
});

// 生成数据总结
function generateSummary(apps) {
    const total = apps.length;
    const today = apps.filter(a => new Date(a.submitTime).toDateString() === new Date().toDateString()).length;
    
    // 学院分布
    const colleges = {};
    apps.forEach(a => {
        colleges[a.college] = (colleges[a.college] || 0) + 1;
    });
    
    // 年级分布
    const grades = {};
    apps.forEach(a => {
        grades[a.grade] = (grades[a.grade] || 0) + 1;
    });
    
    // 专业分布
    const majors = {};
    apps.forEach(a => {
        majors[a.major] = (majors[a.major] || 0) + 1;
    });
    
    return {
        total,
        today,
        colleges: Object.entries(colleges).sort((a,b) => b[1] - a[1]).slice(0, 5),
        grades: Object.entries(grades).sort((a,b) => b[1] - a[1]),
        majors: Object.entries(majors).sort((a,b) => b[1] - a[1]).slice(0, 5),
        recentApplications: apps.slice(-5).reverse()
    };
}

module.exports = router;
