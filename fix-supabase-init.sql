-- ===== 修复 Supabase 初始化错误 =====
-- 解决：relation "supabase_migrations.schema_migrations" does not exist

-- 第 1 步：创建 schema_migrations 表（如果不存在）
CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
    version TEXT PRIMARY KEY,
    inserted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 第 2 步：创建 supabase_migrations schema（如果不存在）
CREATE SCHEMA IF NOT EXISTS supabase_migrations;

-- 第 3 步：重新创建应用表（使用 IF NOT EXISTS）
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

-- 第 4 步：重新创建管理员表
CREATE TABLE IF NOT EXISTS admins (
    id BIGSERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 第 5 步：插入默认管理员（如果不存在）
INSERT INTO admins (username, password) 
VALUES ('admin', 'admin123')
ON CONFLICT (username) DO NOTHING;

-- 第 6 步：启用行级安全
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- 第 7 步：删除旧策略（如果存在）
DROP POLICY IF EXISTS "Allow public read access" ON applications;
DROP POLICY IF EXISTS "Allow public insert access" ON applications;
DROP POLICY IF EXISTS "Allow public update access" ON applications;
DROP POLICY IF EXISTS "Allow public delete access" ON applications;

DROP POLICY IF EXISTS "Allow admin read access" ON admins;
DROP POLICY IF EXISTS "Allow admin insert access" ON admins;
DROP POLICY IF EXISTS "Allow admin update access" ON admins;
DROP POLICY IF EXISTS "Allow admin delete access" ON admins;

-- 第 8 步：创建新策略
CREATE POLICY "Allow public read access" ON applications FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON applications FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON applications FOR DELETE USING (true);

CREATE POLICY "Allow admin read access" ON admins FOR SELECT USING (true);
CREATE POLICY "Allow admin insert access" ON admins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin update access" ON admins FOR UPDATE USING (true);
CREATE POLICY "Allow admin delete access" ON admins FOR DELETE USING (true);

-- 第 9 步：验证表已创建
SELECT 'applications' as table_name, COUNT(*) as row_count FROM applications
UNION ALL
SELECT 'admins' as table_name, COUNT(*) as row_count FROM admins;

-- 完成提示
SELECT '✅ 数据库初始化完成！' as status;
