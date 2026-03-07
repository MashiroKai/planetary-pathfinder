# ☁️ 云端存储配置指南

## 问题说明

**当前问题：** 申请数据只保存在本地浏览器（localStorage），不同设备无法同步查看。

**解决方案：** 使用 Supabase 免费云数据库实现数据云端存储和同步。

---

## 🚀 快速开始（5 分钟配置）

### 第 1 步：创建 Supabase 账号

1. 访问 https://supabase.com
2. 点击 "Start your project"
3. 使用 GitHub 账号登录（推荐）或邮箱注册

### 第 2 步：创建新项目

1. 点击 "New Project"
2. 填写项目信息：
   - **Name:** `planetary-pathfinder`
   - **Database Password:** 设置一个强密码（保存好！）
   - **Region:** 选择离中国最近的（推荐 `Singapore` 新加坡）
3. 点击 "Create new project"（等待 2-3 分钟）

### 第 3 步：获取 API 密钥

1. 进入项目后，点击左侧 **Settings** → **API**
2. 复制以下两个关键信息：
   - **Project URL:** `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key:** `eyJhbGc...`（以 ey 开头的长字符串）

### 第 4 步：创建数据表

1. 点击左侧 **SQL Editor**
2. 点击 "New Query"
3. 粘贴以下 SQL 代码并运行：

```sql
-- 创建报名表
CREATE TABLE applications (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    gender TEXT,
    college TEXT,
    major TEXT,
    grade TEXT,
    student_id TEXT,
    email TEXT,
    phone TEXT,
    skills TEXT,
    motivation TEXT,
    submit_time TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建管理员表
CREATE TABLE admins (
    id BIGSERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 插入默认管理员（首次使用）
INSERT INTO admins (username, password) VALUES ('admin', 'admin123');

-- 设置行级安全策略（允许匿名读写 - 仅用于演示）
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 创建公开访问策略（生产环境应该加强权限）
CREATE POLICY "Allow public read access" ON applications FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON applications FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON applications FOR DELETE USING (true);

CREATE POLICY "Allow admin read access" ON admins FOR SELECT USING (true);
CREATE POLICY "Allow admin insert access" ON admins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin update access" ON admins FOR UPDATE USING (true);
CREATE POLICY "Allow admin delete access" ON admins FOR DELETE USING (true);
```

4. 点击 "Run" 运行 SQL

### 第 5 步：配置网站

1. 打开 `cloud-config.js` 文件
2. 填入你的 Supabase 信息：

```javascript
const SUPABASE_URL = 'https://你的项目 ID.supabase.co';
const SUPABASE_KEY = '你的 anon public key';
```

3. 在 `index.html` 的 `<head>` 中添加：

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="cloud-config.js"></script>
<script src="cloud-storage.js"></script>
```

4. 修改 `script.js` 启用云端存储（见下方代码示例）

---

## 📁 文件结构

```
E:\OpenClaw Space\PathFinder/
├── cloud-config.js          # Supabase 配置（需手动填写）
├── cloud-storage.js         # 云端存储逻辑
├── script.js                # 主脚本（需修改）
├── dashboard.js             # 后台脚本（需修改）
└── CLOUD_SETUP.md           # 本文档
```

---

## 🔧 代码修改

### 1. 创建 cloud-config.js

```javascript
// Supabase 配置
const SUPABASE_URL = 'https://你的项目 ID.supabase.co';
const SUPABASE_KEY = '你的 anon public key';

// 初始化 Supabase 客户端
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
```

### 2. 创建 cloud-storage.js

```javascript
// 云端存储模块
const CloudStorage = {
    // 保存申请
    async saveApplication(data) {
        try {
            const { data: result, error } = await supabase
                .from('applications')
                .insert([data]);
            
            if (error) throw error;
            console.log('[Cloud] 申请已保存到云端');
            return { success: true, data: result };
        } catch (err) {
            console.error('[Cloud] 保存失败:', err);
            return { success: false, error: err };
        }
    },

    // 获取所有申请
    async getApplications() {
        try {
            const { data, error } = await supabase
                .from('applications')
                .select('*')
                .order('submit_time', { ascending: false });
            
            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('[Cloud] 获取失败:', err);
            return [];
        }
    },

    // 删除申请
    async deleteApplication(id) {
        try {
            const { error } = await supabase
                .from('applications')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return { success: true };
        } catch (err) {
            console.error('[Cloud] 删除失败:', err);
            return { success: false, error: err };
        }
    },

    // 管理员验证
    async validateAdmin(username, password) {
        try {
            const { data, error } = await supabase
                .from('admins')
                .select('*')
                .eq('username', username)
                .eq('password', password)
                .single();
            
            if (error || !data) return { success: false };
            return { success: true, user: data };
        } catch (err) {
            return { success: false, error: err };
        }
    },

    // 添加管理员
    async addAdmin(username, password) {
        try {
            const { error } = await supabase
                .from('admins')
                .insert([{ username, password }]);
            
            if (error) throw error;
            return { success: true };
        } catch (err) {
            return { success: false, error: err };
        }
    },

    // 修改密码
    async updatePassword(username, newPassword) {
        try {
            const { error } = await supabase
                .from('admins')
                .update({ password: newPassword })
                .eq('username', username);
            
            if (error) throw error;
            return { success: true };
        } catch (err) {
            return { success: false, error: err };
        }
    }
};
```

### 3. 修改 script.js（申请提交）

在 `submitApplication` 函数中添加云端保存：

```javascript
// 保存到云端
const cloudResult = await CloudStorage.saveApplication(data);
if (cloudResult.success) {
    console.log('云端保存成功');
} else {
    console.log('云端保存失败，仅保存到本地');
}
```

### 4. 修改 dashboard.js（后台数据加载）

在 `loadApplications` 函数中从云端获取：

```javascript
async function loadApplications() {
    const apps = await CloudStorage.getApplications();
    renderApplications(apps);
}
```

---

## 🔐 安全建议（生产环境）

### 1. 加强数据库权限

```sql
-- 只允许 authenticated 用户写入
CREATE POLICY "Only authenticated can insert" 
ON applications FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- 只允许管理员读取
CREATE POLICY "Only admins can read" 
ON applications FOR SELECT 
USING (auth.role() = 'authenticated');
```

### 2. 使用 Supabase 认证

- 启用邮箱/密码认证
- 或使用 GitHub/Google 第三方登录
- 参考：https://supabase.com/docs/guides/auth

### 3. 密码加密

当前为演示使用明文密码，生产环境应该：
- 使用 bcrypt 或 Argon2 加密
- 或在 Supabase Edge Functions 中处理认证

---

## 📊 免费额度

Supabase 免费计划：
- ✅ 500MB 数据库空间（可存约 10 万条申请）
- ✅ 2GB 月带宽
- ✅ 5 万月活跃用户
- ✅ 社区支持

对于校园项目完全够用！

---

## 🎯 替代方案

如果不想用 Supabase，可考虑：

### 方案 2：Feishu Bitable（飞书多维表格）
- 适合已有飞书团队的场景
- 通过 OpenClaw Feishu 扩展访问
- 需要配置飞书应用

### 方案 3：Firebase
- Google 提供的云数据库
- 类似 Supabase，免费额度更大
- 国内访问可能较慢

### 方案 4：自建后端
- 使用 Node.js + MongoDB/PostgreSQL
- 部署在 VPS 或云平台
- 完全控制，但需要运维

---

## ✅ 配置检查清单

- [ ] 创建 Supabase 账号
- [ ] 创建项目并获取 API 密钥
- [ ] 运行 SQL 创建数据表
- [ ] 填写 cloud-config.js 配置
- [ ] 在 HTML 中引入 Supabase JS SDK
- [ ] 修改 script.js 启用云端保存
- [ ] 修改 dashboard.js 启用云端读取
- [ ] 测试申请提交和后台查看
- [ ] （可选）加强安全策略

---

## 📞 需要帮助？

配置过程中遇到问题：
1. 检查浏览器控制台错误信息
2. 确认 Supabase URL 和 Key 正确
3. 检查数据表权限设置
4. 联系：kaiyu@mail.ustc.edu.cn

---

*最后更新：2026-03-07*
