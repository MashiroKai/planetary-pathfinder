// ===== 云端存储配置 =====
// 请在 Supabase 控制台获取你的项目信息并填写下方配置

// Supabase 配置
var SUPABASE_URL = 'https://ufnxulsoyownqyqwolxm.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmbnh1bHNveW93bnF5cXdvbHhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MTI1NjEsImV4cCI6MjA4ODM4ODU2MX0.RO6QRQZlilS6v1H-C_MWcLd5QFv4UvWZvO7F8HNFd0E';

// 云端存储开关
var CLOUD_ENABLED = true;

// 初始化 Supabase 客户端
function initSupabase() {
    if (typeof window.supabase === 'undefined') {
        console.log('[Config] 等待 Supabase SDK 加载...');
        setTimeout(initSupabase, 100);
        return;
    }
    
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log('[PathFinder] 云端存储配置加载完成');
    console.log('[PathFinder] Supabase URL:', SUPABASE_URL);
    console.log('[PathFinder] 云端存储已启用');
    console.log('[PathFinder] Supabase 客户端已初始化');
}

// 启动初始化
initSupabase();
