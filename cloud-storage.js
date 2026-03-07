// ===== 云端存储模块 =====
// 行星探路者 - 云端数据同步

var CloudStorage = {
    // 获取 Supabase 客户端
    getClient: function() {
        return window.supabaseClient;
    },

    // 检查云端是否可用
    isAvailable: function() {
        var available = CLOUD_ENABLED === true && 
               SUPABASE_URL && SUPABASE_URL.indexOf('YOUR_PROJECT_ID') === -1 && 
               SUPABASE_KEY && SUPABASE_KEY.indexOf('YOUR_ANON_KEY') === -1 &&
               typeof window.supabaseClient !== 'undefined';
        
        console.log('[Cloud] isAvailable 检查:', {
            CLOUD_ENABLED: CLOUD_ENABLED,
            URL_OK: SUPABASE_URL && SUPABASE_URL.indexOf('YOUR_PROJECT_ID') === -1,
            KEY_OK: SUPABASE_KEY && SUPABASE_KEY.indexOf('YOUR_ANON_KEY') === -1,
            CLIENT_OK: typeof window.supabaseClient !== 'undefined'
        });
        
        return available;
    },

    // 保存申请到云端
    saveApplication: async function(data) {
        console.log('[Cloud] saveApplication 开始...');
        
        if (!this.isAvailable()) {
            console.log('[Cloud] 云端不可用，返回失败');
            return { success: false, local: true, error: new Error('云端未启用') };
        }

        try {
            var client = this.getClient();
            console.log('[Cloud] 客户端:', client ? 'OK' : 'NULL');
            console.log('[Cloud] 插入数据:', data);
            
            var result = await client.from('applications').insert([data]);
            
            console.log('[Cloud] 插入结果:', result);
            
            if (result.error) {
                console.error('[Cloud] 插入错误:', result.error);
                throw result.error;
            }
            
            console.log('[Cloud] ✓ 申请已保存到云端');
            return { success: true, data: result.data };
        } catch (err) {
            console.error('[Cloud] ✗ 保存失败:', err.message);
            return { success: false, error: err };
        }
    },

    // 从云端获取所有申请
    getApplications: async function() {
        if (!this.isAvailable()) {
            return null;
        }

        try {
            var client = this.getClient();
            var result = await client.from('applications').select('*').order('submit_time', { ascending: false });
            
            if (result.error) throw result.error;
            console.log('[Cloud] 获取到', result.data ? result.data.length : 0, '条申请');
            return result.data || [];
        } catch (err) {
            console.error('[Cloud] 获取失败:', err.message);
            return null;
        }
    },

    // 从云端删除申请
    deleteApplication: async function(id) {
        if (!this.isAvailable()) {
            return { success: false, error: '云端未启用' };
        }

        try {
            var client = this.getClient();
            
            // 先尝试用 id 删除
            var result = await client.from('applications').delete().eq('id', id);
            
            if (result.error) {
                // 如果 id 删除失败，尝试用 name 删除
                console.log('[Cloud] ID 删除失败，尝试用 name 删除:', id);
                result = await client.from('applications').delete().eq('name', id);
            }
            
            if (result.error) throw result.error;
            console.log('[Cloud] 已删除申请:', id);
            return { success: true };
        } catch (err) {
            console.error('[Cloud] 删除失败:', err.message);
            return { success: false, error: err };
        }
    },

    // 管理员登录验证
    validateAdmin: async function(username, password) {
        if (!this.isAvailable()) {
            return { success: false, error: '云端未启用' };
        }

        try {
            var client = this.getClient();
            var result = await client.from('admins').select('*').eq('username', username).eq('password', password).single();
            
            if (result.error || !result.data) {
                return { success: false };
            }
            return { success: true, user: result.data };
        } catch (err) {
            return { success: false, error: err };
        }
    },

    // 添加管理员
    addAdmin: async function(username, password) {
        if (!this.isAvailable()) {
            return { success: false, error: '云端未启用' };
        }

        try {
            var client = this.getClient();
            var result = await client.from('admins').insert([{ username: username, password: password }]);
            
            if (result.error) throw result.error;
            console.log('[Cloud] 已添加管理员');
            return { success: true };
        } catch (err) {
            console.error('[Cloud] 添加失败:', err.message);
            return { success: false, error: err };
        }
    },

    // 修改管理员密码
    updatePassword: async function(username, newPassword) {
        if (!this.isAvailable()) {
            return { success: false, error: '云端未启用' };
        }

        try {
            var client = this.getClient();
            var result = await client.from('admins').update({ password: newPassword }).eq('username', username);
            
            if (result.error) throw result.error;
            console.log('[Cloud] 密码已更新');
            return { success: true };
        } catch (err) {
            console.error('[Cloud] 修改失败:', err.message);
            return { success: false, error: err };
        }
    },

    // 获取统计数据
    getStats: async function() {
        if (!this.isAvailable()) {
            return null;
        }

        try {
            var client = this.getClient();
            var result = await client.from('applications').select('*', { count: 'exact', head: true });
            
            if (result.error) throw result.error;
            return { total: result.count };
        } catch (err) {
            console.error('[Cloud] 获取统计失败:', err.message);
            return null;
        }
    }
};

console.log('[Cloud] 云端存储模块已加载');
