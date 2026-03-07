-- ===== 修复 applications 表列名 =====
-- 问题：is_test 列不存在
-- 解决：添加缺失的列

-- 添加 is_test 列（如果不存在）
ALTER TABLE applications 
ADD COLUMN IF NOT EXISTS is_test BOOLEAN DEFAULT FALSE;

-- 验证列已添加
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'applications'
ORDER BY ordinal_position;

-- 测试插入
INSERT INTO applications (name, is_test) 
VALUES ('测试', true);

-- 清理测试数据
DELETE FROM applications WHERE is_test = true;

SELECT '✅ 列已修复！' as status;
