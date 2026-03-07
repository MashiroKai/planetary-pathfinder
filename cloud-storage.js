// ===== 云端存储模块 =====

var CloudStorage = {
    getClient: function() {
        return window.supabaseClient;
    },

    isAvailable: function() {
        var available = CLOUD_ENABLED && 
               SUPABASE_URL.indexOf('YOUR_PROJECT_ID') === -1 && 
               SUPABASE_KEY.indexOf('YOUR_ANON_KEY') === -1 &&
               typeof window.supabaseClient !== 'undefined';
        
        if (!available) {
            console.log('[Cloud] 云端不可用');
        }
        
        return available;
    },

    saveApplication: async function(data) {
        if (!this.isAvailable()) {
            console.log('[Cloud] 云端未启用');
            return { success: false, local: true };
        }

        try {
            var client = this.getClient();
            var result = await client.from('applications').insert([data]);
            
            if (result.error) throw result.error;
            console.log('[Cloud] 申请已保存到云端');
            return { success: true, data: result.data };
        } catch (err) {
            console.error('[Cloud] 保存失败:', err.message);
            return { success: false, error: err };
        }
    },

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

    deleteApplication: async function(id) {
        if (!this.isAvailable()) {
            return { success: false, error: '云端未启用' };
        }

        try {
            var client = this.getClient();
            var result = await client.from('applications').delete().eq('id', id);
            
            if (result.error) throw result.error;
            console.log('[Cloud] 已删除申请');
            return { success: true };
        } catch (err) {
            console.error('[Cloud] 删除失败:', err.message);
            return { success: false, error: err };
        }
    },

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
    }
};

console.log('[PathFinder] 云端存储模块加载完成');
