// ===== 云端存储配置 =====
// 请在 Supabase 控制台获取你的项目信息并填写下方配置
// 教程：查看 CLOUD_SETUP.md

// 使用 var 避免重复声明错误
var SUPABASE_URL = 'https://ufnxulsoyownqyqwolxm.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmbnh1bHNveW93bnF5cXdvbHhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MTI1NjEsImV4cCI6MjA4ODM4ODU2MX0.RO6QRQZlilS6v1H-C_MWcLd5QFv4UvWZvO7F8HNFd0E';

// 初始化 Supabase 客户端（如果还未初始化）
if (typeof window.supabaseClient === 'undefined') {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// 云端存储开关（配置完成后改为 true）
var CLOUD_ENABLED = true;

console.log('[PathFinder] 云端存储配置加载完成');
console.log('[PathFinder] Supabase URL:', SUPABASE_URL);
console.log('[PathFinder] 云端存储已启用');
