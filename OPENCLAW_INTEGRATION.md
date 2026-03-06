# OpenClaw 飞书集成指南

## 📋 概述

行星探路者报名管理系统已集成 OpenClaw 控制接口，可通过飞书机器人远程管理后台数据。

---

## 🔧 配置步骤

### 1. 设置环境变量

```bash
# 设置 OpenClaw 访问令牌
export OPENCLAW_TOKEN="your_secure_token_here"
```

### 2. 飞书机器人配置

在飞书开放平台创建机器人，获取 webhook URL。

### 3. OpenClaw 配置

在 OpenClaw 工作区配置飞书集成：

```yaml
feishu:
  webhook: https://open.feishu.cn/open-apis/bot/v2/hook/xxx
  token: your_secure_token_here
```

---

## 📡 API 接口

### 基础信息

- **端点**: `/api/openclaw/webhook`
- **方法**: `POST`
- **认证**: `Authorization: Bearer {OPENCLAW_TOKEN}`

### 可用操作

#### 1. 获取所有报名申请

```json
{
  "action": "get_applications"
}
```

**响应:**
```json
{
  "success": true,
  "data": [...],
  "count": 10
}
```

---

#### 2. 获取统计数据

```json
{
  "action": "get_stats"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "today": 3,
    "admins": 2
  }
}
```

---

#### 3. 导出数据

```json
{
  "action": "export_data"
}
```

**响应:**
```json
{
  "success": true,
  "data": [...],
  "format": "json",
  "downloadUrl": "/api/openclaw/download"
}
```

---

#### 4. 添加管理员

```json
{
  "action": "add_admin",
  "params": {
    "username": "newadmin",
    "password": "secure_password"
  }
}
```

**响应:**
```json
{
  "success": true,
  "message": "管理员 \"newadmin\" 添加成功"
}
```

---

#### 5. 列出管理员

```json
{
  "action": "list_admins"
}
```

**响应:**
```json
{
  "success": true,
  "data": [
    { "username": "admin", "createdAt": "2026-03-07T00:00:00Z" },
    { "username": "newadmin", "createdAt": "2026-03-07T12:00:00Z" }
  ]
}
```

---

#### 6. 数据总结

```json
{
  "action": "summary"
}
```

**响应:**
```json
{
  "success": true,
  "summary": {
    "total": 10,
    "today": 3,
    "colleges": [
      ["物理学院", 5],
      ["电子工程", 3],
      ["计算机科学", 2]
    ],
    "grades": [
      ["大二", 4],
      ["大三", 4],
      ["大四", 2]
    ],
    "majors": [
      ["核物理", 3],
      ["电子信息", 3],
      ["软件工程", 2]
    ],
    "recentApplications": [...]
  }
}
```

---

## 🤖 飞书机器人命令示例

### 查看今日报名统计

```
/planetary stats
```

**回复:**
```
📊 行星探路者报名统计

总申请数：10
今日申请：3
管理员数：2

热门学院：
• 物理学院：5 人
• 电子工程：3 人
• 计算机科学：2 人
```

---

### 导出报名数据

```
/planetary export
```

**回复:**
```
📥 数据已准备就绪

下载链接：https://your-domain.com/api/openclaw/download

包含 10 条报名记录
文件大小：2.3 KB
```

---

### 添加管理员

```
/planetary addadmin username password
```

**回复:**
```
✅ 管理员 "username" 添加成功

可通过 admin.html 登录管理后台
```

---

### 查看数据总结

```
/planetary summary
```

**回复:**
```
📈 报名数据总结

【总体情况】
总申请：10 人
今日新增：3 人

【年级分布】
大二：4 人 (40%)
大三：4 人 (40%)
大四：2 人 (20%)

【专业 TOP5】
1. 核物理：3 人
2. 电子信息：3 人
3. 软件工程：2 人

【最近申请】
• 张三 - 物理学院 - 大二
• 李四 - 电子工程 - 大三
• 王五 - 计算机科学 - 大四
```

---

## 🔐 安全建议

1. **使用强 Token**: 生成至少 32 位随机字符串作为 Token
2. **HTTPS**: 生产环境务必使用 HTTPS
3. **IP 白名单**: 限制 OpenClaw 服务器 IP
4. **定期审计**: 定期检查管理员列表和操作日志

---

## 📁 文件结构

```
E:\OpenClaw Space\PathFinder/
├── admin.html              # 管理员登录页面
├── dashboard.html          # 管理后台界面
├── dashboard.js            # 后台管理脚本
├── openclaw-api.js         # OpenClaw API 接口
├── OPENCLAW_INTEGRATION.md # 本文档
└── index.html              # 主页面（页脚有管理员入口）
```

---

## 🎯 快速开始

### 本地测试

1. 启动本地服务器
2. 访问 `http://localhost/admin.html`
3. 默认账号：`admin` / `admin123`

### OpenClaw 测试

```bash
curl -X POST http://localhost/api/openclaw/webhook \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{"action": "get_stats"}'
```

---

## 📞 技术支持

如有问题，请联系：
- 邮箱：kaiyu@mail.ustc.edu.cn
- 仓库：https://github.com/MashiroKai/planetary-pathfinder

---

*最后更新：2026-03-07*
