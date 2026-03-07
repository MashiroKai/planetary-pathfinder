// ===== 云端存储配置 =====
// 行星探路者 - Supabase 配置

// Supabase 项目配置
var SUPABASE_URL = 'https://ufnxulsoyownqyqwolxm.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmbnh1bHNveW93bnF5cXdvbHhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MTI1NjEsImV4cCI6MjA4ODM4ODU2MX0.RO6QRQZlilS6v1H-C_MWcLd5QFv4UvWZvO7F8HNFd0E';

// 云端存储开关
var CLOUD_ENABLED = true;

// 初始化 Supabase 客户端
function initSupabaseClient() {
    if (typeof window.supabase === 'undefined') {
        console.log('[Config] 等待 Supabase SDK 加载...');
        setTimeout(initSupabaseClient, 100);
        return;
    }
    
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    
    console.log('[Config] ================================');
    console.log('[Config] 行星探路者 - 云端存储配置');
    console.log('[Config] ================================');
    console.log('[Config] URL:', SUPABASE_URL);
    console.log('[Config] Key:', SUPABASE_KEY.substring(0, 20) + '...');
    console.log('[Config] CLOUD_ENABLED:', CLOUD_ENABLED);
    console.log('[Config] Supabase 客户端：', window.supabaseClient ? '已初始化 ✓' : '失败 ✗');
    console.log('[Config] ================================');
}

// 启动初始化
initSupabaseClient();
