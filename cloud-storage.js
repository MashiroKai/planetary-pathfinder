// ===== 云端存储模块 =====
// 实现数据的云端同步（使用 Supabase）

const CloudStorage = {
    // 检查云端是否可用
    isAvailable() {
        const available = CLOUD_ENABLED && 
               SUPABASE_URL !== 'https://YOUR_PROJECT_ID.supabase.co' && 
               SUPABASE_KEY !== 'YOUR_ANON_KEY' &&
               typeof window.supabase !== 'undefined';
        
        if (!available) {
            console.log('[Cloud] 云端不可用:', {
                CLOUD_ENABLED,
                URL_CONFIGURED: SUPABASE_URL !== 'https://YOUR_PROJECT_ID.supabase.co',
                KEY_CONFIGURED: SUPABASE_KEY !== 'YOUR_ANON_KEY',
                SDK_LOADED: typeof window.supabase !== 'undefined'
            });
        }
        
        return available;
    },

    // 保存申请到云端
    async saveApplication(data) {
        if (!this.isAvailable()) {
            console.log('[Cloud] 云端未启用，仅保存到本地');
            return { success: false, local: true };
        }

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

    // 从云端获取所有申请
    async getApplications() {
        if (!this.isAvailable()) {
            console.log('[Cloud] 云端未启用，返回本地数据');
            return null;
        }

        try {
            const { data, error } = await supabase
                .from('applications')
                .select('*')
                .order('submit_time', { ascending: false });
            
            if (error) throw error;
            console.log('[Cloud] 获取到', data?.length || 0, '条申请');
            return data || [];
        } catch (err) {
            console.error('[Cloud] 获取失败:', err);
            return null;
        }
    },

    // 从云端删除申请
    async deleteApplication(id) {
        if (!this.isAvailable()) {
            return { success: false, error: '云端未启用' };
        }

        try {
            const { error } = await supabase
                .from('applications')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            console.log('[Cloud] 已删除申请 ID:', id);
            return { success: true };
        } catch (err) {
            console.error('[Cloud] 删除失败:', err);
            return { success: false, error: err };
        }
    },

    // 管理员登录验证
    async validateAdmin(username, password) {
        if (!this.isAvailable()) {
            return { success: false, error: '云端未启用' };
        }

        try {
            const { data, error } = await supabase
                .from('admins')
                .select('*')
                .eq('username', username)
                .eq('password', password)
                .single();
            
            if (error || !data) {
                return { success: false };
            }
            return { success: true, user: data };
        } catch (err) {
            return { success: false, error: err };
        }
    },

    // 添加管理员
    async addAdmin(username, password) {
        if (!this.isAvailable()) {
            return { success: false, error: '云端未启用' };
        }

        try {
            const { error } = await supabase
                .from('admins')
                .insert([{ username, password }]);
            
            if (error) throw error;
            console.log('[Cloud] 已添加管理员:', username);
            return { success: true };
        } catch (err) {
            console.error('[Cloud] 添加管理员失败:', err);
            return { success: false, error: err };
        }
    },

    // 修改管理员密码
    async updatePassword(username, newPassword) {
        if (!this.isAvailable()) {
            return { success: false, error: '云端未启用' };
        }

        try {
            const { error } = await supabase
                .from('admins')
                .update({ password: newPassword })
                .eq('username', username);
            
            if (error) throw error;
            console.log('[Cloud] 密码已更新:', username);
            return { success: true };
        } catch (err) {
            console.error('[Cloud] 修改密码失败:', err);
            return { success: false, error: err };
        }
    },

    // 获取统计数据
    async getStats() {
        if (!this.isAvailable()) {
            return null;
        }

        try {
            const { count, error } = await supabase
                .from('applications')
                .select('*', { count: 'exact', head: true });
            
            if (error) throw error;
            return { total: count };
        } catch (err) {
            console.error('[Cloud] 获取统计失败:', err);
            return null;
        }
    }
};

console.log('[PathFinder] 云端存储模块加载完成');
