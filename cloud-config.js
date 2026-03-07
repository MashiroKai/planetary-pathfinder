// ===== 云端存储配置 =====
// 请在 Supabase 控制台获取你的项目信息并填写下方配置
// 教程：查看 CLOUD_SETUP.md

const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';  // 替换为你的 Project URL
const SUPABASE_KEY = 'YOUR_ANON_KEY';  // 替换为你的 anon public key

// 初始化 Supabase 客户端
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 云端存储开关（配置完成后改为 true）
const CLOUD_ENABLED = false;

console.log('[PathFinder] 云端存储配置加载完成');
