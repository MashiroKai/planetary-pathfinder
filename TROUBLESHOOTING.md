# 🔧 云端配置故障排查

## 问题 1: 测试页面一直显示"检查中"

### 可能原因
1. **Supabase SDK 加载失败** - 网络问题导致 CDN 无法访问
2. **JavaScript 错误** - 配置格式错误导致脚本中断

### 解决方法

#### 方法 1: 打开浏览器控制台查看错误
1. 在测试页面按 `F12` 或右键 → 检查
2. 切换到 **Console** 标签
3. 查看红色错误信息

#### 方法 2: 检查配置
打开 `cloud-config.js` 确认：
```javascript
const SUPABASE_URL = 'https://你的项目 ID.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xxx';  // 或 eyJ 开头
const CLOUD_ENABLED = true;
```

#### 方法 3: 本地测试
如果 GitHub Pages 加载慢，可以：
1. 下载项目到本地
2. 用浏览器直接打开 `test-cloud.html`
3. 按 F12 查看详细错误

---

## 问题 2: Publishable Key 格式

### 正确格式
Supabase 有两种 Key：

**✅ Publishable key (anon public)**
- 格式：`sb_publishable_xxx` 或 `eyJxxx`
- 用途：前端公开访问
- **使用这个！**

**❌ Service role key**
- 格式：`sb_service_role_xxx` 或 `eyJxxx`
- 用途：后端管理
- **不要在前端使用！**

### 获取正确的 Key
1. 登录 Supabase 控制台
2. 进入项目 → **Settings** → **API**
3. 复制 **Project API keys** 下的 `anon public` key
4. 粘贴到 `cloud-config.js` 的 `SUPABASE_KEY`

---

## 问题 3: 数据库表不存在

### 症状
- URL 和 Key 检查通过
- 数据库表检查失败

### 解决方法
1. 登录 Supabase 控制台
2. 进入 **SQL Editor**
3. 重新运行建表 SQL（见下方）

### 建表 SQL
```sql
-- 创建报名表
CREATE TABLE IF NOT EXISTS applications (
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_test BOOLEAN DEFAULT FALSE
);

-- 创建管理员表
CREATE TABLE IF NOT EXISTS admins (
    id BIGSERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 插入默认管理员（如果不存在）
INSERT INTO admins (username, password) 
VALUES ('admin', 'admin123')
ON CONFLICT (username) DO NOTHING;

-- 设置行级安全策略
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 创建公开访问策略
DROP POLICY IF EXISTS "Allow public read access" ON applications;
DROP POLICY IF EXISTS "Allow public insert access" ON applications;
DROP POLICY IF EXISTS "Allow public update access" ON applications;
DROP POLICY IF EXISTS "Allow public delete access" ON applications;

CREATE POLICY "Allow public read access" ON applications FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON applications FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON applications FOR DELETE USING (true);

CREATE POLICY "Allow admin read access" ON admins FOR SELECT USING (true);
CREATE POLICY "Allow admin insert access" ON admins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin update access" ON admins FOR UPDATE USING (true);
CREATE POLICY "Allow admin delete access" ON admins FOR DELETE USING (true);
```

---

## 问题 4: CORS 错误

### 症状
控制台显示：
```
Access to fetch at 'https://xxx.supabase.co' from origin 'xxx' has been blocked by CORS policy
```

### 解决方法
1. 这是浏览器安全策略，通常不影响实际使用
2. 确保在 **HTTPS** 环境下访问（GitHub Pages 默认 HTTPS）
3. 本地测试时使用 `localhost` 或 `127.0.0.1`

---

## 问题 5: 权限不足

### 症状
- 读写测试失败
- 错误信息包含 "permission denied"

### 解决方法
1. 检查 Row Level Security (RLS) 是否启用
2. 确认策略（Policies）已正确创建
3. 在 Supabase 控制台 → **Authentication** → **Policies** 查看

---

## 快速诊断流程

### 步骤 1: 检查配置
```javascript
// 在浏览器控制台运行
console.log('URL:', SUPABASE_URL);
console.log('Key:', SUPABASE_KEY);
console.log('Enabled:', CLOUD_ENABLED);
console.log('SDK:', typeof window.supabase);
```

**期望输出：**
```
URL: https://xxx.supabase.co
Key: sb_publishable_xxx
Enabled: true
SDK: object
```

### 步骤 2: 手动测试连接
```javascript
// 在浏览器控制台运行
supabase.from('applications').select('count').then(r => {
    console.log('连接成功:', r);
}).catch(e => {
    console.error('连接失败:', e);
});
```

### 步骤 3: 检查数据表
在 Supabase 控制台 → **Table Editor** 查看：
- ✅ applications 表存在
- ✅ admins 表存在

---

## 联系支持

如果以上方法都无法解决：
1. 截图测试页面结果
2. 复制浏览器控制台错误信息
3. 联系：kaiyu@mail.ustc.edu.cn

---

*最后更新：2026-03-07*
