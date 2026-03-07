// ===== 管理后台脚本 =====

// 检查登录状态
if (!localStorage.getItem('adminToken')) {
    window.location.href = 'admin.html';
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    initConfirmDialog();
});

// ===== Toast 提示系统 =====
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    toast.innerHTML = `
        <div class="toast-icon ${type}">${icons[type] || icons.info}</div>
        <div class="toast-message">${message}</div>
        <div class="toast-close" onclick="this.parentElement.remove()">&times;</div>
    `;
    
    container.appendChild(toast);
    
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });
    
    if (duration > 0) {
        setTimeout(() => hideToast(toast), duration);
    }
    
    return toast;
}

function hideToast(toast) {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
}

// ===== 确认对话框 =====
let confirmCallback = null;

function initConfirmDialog() {
    const overlay = document.getElementById('confirmOverlay');
    if (!overlay) return;
    
    overlay.querySelector('.btn-cancel').addEventListener('click', hideConfirmDialog);
    overlay.querySelector('.btn-confirm').addEventListener('click', () => {
        if (confirmCallback) {
            confirmCallback();
            hideConfirmDialog();
        }
    });
}

function showConfirmDialog(title, message, onConfirm, type = 'default') {
    confirmCallback = onConfirm;
    
    const overlay = document.getElementById('confirmOverlay');
    const titleEl = overlay.querySelector('.confirm-title');
    const messageEl = overlay.querySelector('.confirm-message');
    const confirmBtn = overlay.querySelector('.btn-confirm');
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    if (type === 'danger') {
        confirmBtn.style.background = '#dc3545';
    } else {
        confirmBtn.style.background = '';
    }
    
    overlay.style.display = 'flex';
    requestAnimationFrame(() => {
        overlay.classList.add('show');
    });
}

function hideConfirmDialog() {
    const overlay = document.getElementById('confirmOverlay');
    overlay.classList.remove('show');
    setTimeout(() => {
        overlay.style.display = 'none';
        confirmCallback = null;
    }, 200);
}

// ===== 主功能 =====

// 加载仪表板
async function loadDashboard() {
    const user = localStorage.getItem('adminUser');
    if (user) {
        document.getElementById('welcomeUser').textContent = `欢迎，${user}`;
    }
    await loadApplications();
    await loadAdmins();
    await updateStats();
}

// 加载申请数据（云端优先）
async function loadApplications() {
    console.log('[Dashboard] 加载申请数据...');
    
    // 优先从云端获取
    if (typeof CloudStorage !== 'undefined' && CloudStorage.isAvailable()) {
        console.log('[Dashboard] 从云端获取申请...');
        const cloudApps = await CloudStorage.getApplications();
        if (cloudApps !== null) {
            console.log('[Dashboard] 云端获取到', cloudApps.length, '条申请');
            renderApplications(cloudApps);
            return;
        }
    }
    
    // 降级到本地
    console.log('[Dashboard] 从本地获取申请...');
    const apps = JSON.parse(localStorage.getItem('applications') || '[]');
    renderApplications(apps);
}

// 渲染申请列表
function renderApplications(applications) {
    const container = document.getElementById('applicationsTable');
    
    if (applications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>暂无报名申请</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>姓名</th>
                    <th>学院</th>
                    <th>专业</th>
                    <th>年级</th>
                    <th>邮箱</th>
                    <th>手机</th>
                    <th>提交时间</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    applications.forEach((app, index) => {
        const appId = app.id || app.name || index;
        html += `
            <tr>
                <td>${app.name || '-'}</td>
                <td>${app.college || '-'}</td>
                <td>${app.major || '-'}</td>
                <td>${app.grade || '-'}</td>
                <td>${app.email || '-'}</td>
                <td>${app.phone || '-'}</td>
                <td>${formatDate(app.submit_time)}</td>
                <td>
                    <button class="btn-action btn-secondary" style="padding:5px 10px;font-size:12px;background:#dc3545;border-color:#dc3545;" onclick="deleteApplication(${index}, '${appId}')">🗑️ 删除</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// 加载管理员列表（云端优先）
async function loadAdmins() {
    console.log('[Dashboard] 加载管理员列表...');
    
    // 优先从云端获取
    if (typeof CloudStorage !== 'undefined' && CloudStorage.isAvailable()) {
        console.log('[Dashboard] 从云端获取管理员...');
        try {
            const client = CloudStorage.getClient();
            const { data, error } = await client.from('admins').select('*').order('created_at', { ascending: false });
            
            if (error) {
                console.error('[Dashboard] 云端获取管理员失败:', error);
                throw error;
            }
            
            console.log('[Dashboard] 云端获取到', data.length, '个管理员');
            renderAdmins(data || []);
            return;
        } catch (err) {
            console.error('[Dashboard] 云端获取失败，降级到本地:', err);
        }
    }
    
    // 降级到本地
    console.log('[Dashboard] 从本地获取管理员...');
    const admins = JSON.parse(localStorage.getItem('admins') || '[]');
    renderAdmins(admins);
}

// 渲染管理员列表
function renderAdmins(admins) {
    const container = document.getElementById('adminsTable');
    
    if (admins.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>暂无管理员</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>用户名</th>
                    <th>创建时间</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    admins.forEach((admin) => {
        html += `
            <tr>
                <td>${admin.username}</td>
                <td>${formatDate(admin.created_at || admin.createdAt)}</td>
                <td>
                    ${admin.username !== 'admin' ? `<button class="btn-action btn-secondary" style="padding:5px 10px;font-size:12px;" onclick="deleteAdmin('${admin.username}')">删除</button>` : '-'}
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// 更新统计（云端优先）
async function updateStats() {
    console.log('[Dashboard] 更新统计...');
    
    // 优先从云端获取
    if (typeof CloudStorage !== 'undefined' && CloudStorage.isAvailable()) {
        try {
            const client = CloudStorage.getClient();
            
            // 获取申请数
            const { count: appCount } = await client.from('applications').select('*', { count: 'exact', head: true });
            
            // 获取管理员数
            const { count: adminCount } = await client.from('admins').select('*', { count: 'exact', head: true });
            
            // 获取今日申请
            const today = new Date().toISOString().split('T')[0];
            const { count: todayCount } = await client
                .from('applications')
                .select('*', { count: 'exact', head: true })
                .gte('submit_time', today);
            
            document.getElementById('totalApplications').textContent = appCount || 0;
            document.getElementById('todayApplications').textContent = todayCount || 0;
            document.getElementById('totalAdmins').textContent = adminCount || 1;
            
            console.log('[Dashboard] 统计更新完成：申请=' + (appCount || 0) + ', 今日=' + (todayCount || 0) + ', 管理员=' + (adminCount || 1));
            return;
        } catch (err) {
            console.error('[Dashboard] 云端统计失败:', err);
        }
    }
    
    // 降级到本地
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    const admins = JSON.parse(localStorage.getItem('admins') || '[]');
    
    document.getElementById('totalApplications').textContent = applications.length;
    
    const today = new Date().toDateString();
    const todayCount = applications.filter(app => new Date(app.submitTime).toDateString() === today).length;
    document.getElementById('todayApplications').textContent = todayCount;
    
    document.getElementById('totalAdmins').textContent = admins.length;
}

// 导出数据
function exportData() {
    const applications = JSON.parse(localStorage.getItem('applications') || '[]');
    
    if (applications.length === 0) {
        alert('暂无数据可导出');
        return;
    }
    
    let csv = '\uFEFF 姓名，性别，学院，专业，年级，学号，邮箱，手机，技能特长，申请理由，提交时间\n';
    
    applications.forEach(app => {
        csv += `"${app.name || ''}","${app.gender || ''}","${app.college || ''}","${app.major || ''}","${app.grade || ''}","${app.studentId || ''}","${app.email || ''}","${app.phone || ''}","${(app.skills || '').replace(/"/g, '""')}","${(app.motivation || '').replace(/"/g, '""')}","${app.submitTime || ''}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `报名数据_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// 刷新数据
async function refreshData() {
    showToast('正在刷新...', 'info', 1000);
    await loadApplications();
    await loadAdmins();
    await updateStats();
    showToast('✓ 数据已刷新', 'success', 2000);
}

// 切换区块
function showSection(section) {
    document.querySelectorAll('.sidebar-menu a').forEach(a => a.classList.remove('active'));
    event.target.classList.add('active');
    
    document.getElementById('applicationsSection').style.display = 'none';
    document.getElementById('adminsSection').style.display = 'none';
    document.getElementById('settingsSection').style.display = 'none';
    
    document.getElementById(section + 'Section').style.display = 'block';
}

// 显示添加管理员模态框
function showAddAdminModal() {
    const modal = document.getElementById('addAdminModal');
    modal.style.display = 'flex';
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });
}

// 关闭添加管理员模态框
function closeAddAdminModal() {
    const modal = document.getElementById('addAdminModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        document.getElementById('newAdminUsername').value = '';
        document.getElementById('newAdminPassword').value = '';
    }, 200);
}

// 添加管理员（云端同步）
async function handleAddAdmin(event) {
    event.preventDefault();
    
    const username = document.getElementById('newAdminUsername').value;
    const password = document.getElementById('newAdminPassword').value;
    
    console.log('[Dashboard] 添加管理员:', username);
    
    // 优先使用云端
    if (typeof CloudStorage !== 'undefined' && CloudStorage.isAvailable()) {
        const result = await CloudStorage.addAdmin(username, password);
        if (result.success) {
            showToast('✓ 管理员添加成功', 'success', 2500);
            closeAddAdminModal();
            await loadAdmins();
            await updateStats();
            return;
        } else {
            showToast(result.error?.message || '添加失败', 'error', 3000);
            return;
        }
    }
    
    // 降级到本地
    const admins = JSON.parse(localStorage.getItem('admins') || '[]');
    if (admins.some(a => a.username === username)) {
        showToast('用户名已存在', 'error', 3000);
        return;
    }
    admins.push({ username, password, createdAt: new Date().toISOString() });
    localStorage.setItem('admins', JSON.stringify(admins));
    
    showToast('✓ 管理员添加成功', 'success', 2500);
    closeAddAdminModal();
    await loadAdmins();
    await updateStats();
}

// 删除管理员（云端同步）
async function deleteAdmin(username) {
    showConfirmDialog(
        '删除管理员',
        `确定要删除管理员 "${username}" 吗？此操作不可恢复。`,
        async () => {
            console.log('[Dashboard] 删除管理员:', username);
            
            // 优先使用云端
            if (typeof CloudStorage !== 'undefined' && CloudStorage.isAvailable()) {
                try {
                    const client = CloudStorage.getClient();
                    const { error } = await client.from('admins').delete().eq('username', username);
                    
                    if (error) throw error;
                    
                    showToast('✓ 管理员已删除', 'success', 2000);
                    await loadAdmins();
                    await updateStats();
                    return;
                } catch (err) {
                    console.error('[Dashboard] 云端删除失败:', err);
                    showToast('删除失败：' + err.message, 'error', 3000);
                    return;
                }
            }
            
            // 降级到本地
            let admins = JSON.parse(localStorage.getItem('admins') || '[]');
            admins = admins.filter(a => a.username !== username);
            localStorage.setItem('admins', JSON.stringify(admins));
            
            showToast('✓ 管理员已删除', 'success', 2000);
            await loadAdmins();
            await updateStats();
        },
        'danger'
    );
}

// 退出登录
function handleLogout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = 'admin.html';
}

// 删除申请（云端同步删除）
async function deleteApplication(index, appId) {
    showConfirmDialog(
        '删除申请信息',
        '确定要删除这条申请信息吗？此操作不可恢复。',
        async () => {
            console.log('[Dashboard] 删除申请:', appId);
            
            // 优先使用云端删除
            if (typeof CloudStorage !== 'undefined' && CloudStorage.isAvailable()) {
                try {
                    const result = await CloudStorage.deleteApplication(appId);
                    if (result.success) {
                        showToast('✓ 申请已删除', 'success', 2000);
                        await loadApplications();
                        await updateStats();
                        return;
                    } else {
                        throw new Error(result.error?.message || '删除失败');
                    }
                } catch (err) {
                    console.error('[Dashboard] 云端删除失败:', err);
                    
                    // 如果是因为列名问题，尝试用 name 删除
                    if (err.message && err.message.indexOf('is_test') === -1) {
                        try {
                            const client = CloudStorage.getClient();
                            const { error } = await client.from('applications').delete().eq('name', appId);
                            
                            if (error) throw error;
                            
                            showToast('✓ 申请已删除', 'success', 2000);
                            await loadApplications();
                            await updateStats();
                            return;
                        } catch (err2) {
                            console.error('[Dashboard] 备用删除也失败:', err2);
                        }
                    }
                    
                    showToast('删除失败：' + err.message, 'error', 3000);
                    return;
                }
            }
            
            // 降级到本地删除
            const applications = JSON.parse(localStorage.getItem('applications') || '[]');
            applications.splice(index, 1);
            localStorage.setItem('applications', JSON.stringify(applications));
            
            showToast('✓ 申请已删除', 'success', 2000);
            await loadApplications();
            await updateStats();
        },
        'danger'
    );
}

// 显示修改密码模态框
function showChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    modal.style.display = 'flex';
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });
}

// 关闭修改密码模态框
function closeChangePasswordModal() {
    const modal = document.getElementById('changePasswordModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    }, 200);
}

// 修改密码（云端同步）
async function handleChangePassword(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // 验证新密码
    if (newPassword !== confirmPassword) {
        showToast('❌ 两次输入的新密码不一致', 'error', 3000);
        return;
    }
    
    if (newPassword.length < 6) {
        showToast('❌ 密码长度不能少于 6 位', 'error', 3000);
        return;
    }
    
    const currentUser = localStorage.getItem('adminUser');
    
    // 优先使用云端
    if (typeof CloudStorage !== 'undefined' && CloudStorage.isAvailable()) {
        // 先验证当前密码
        const validateResult = await CloudStorage.validateAdmin(currentUser, currentPassword);
        if (!validateResult.success) {
            showToast('❌ 当前密码错误', 'error', 3000);
            return;
        }
        
        // 修改密码
        const result = await CloudStorage.updatePassword(currentUser, newPassword);
        if (result.success) {
            closeChangePasswordModal();
            showToast('✓ 密码修改成功', 'success', 2500);
            return;
        } else {
            showToast(result.error?.message || '修改失败', 'error', 3000);
            return;
        }
    }
    
    // 降级到本地
    const admins = JSON.parse(localStorage.getItem('admins') || '[]');
    const admin = admins.find(a => a.username === currentUser);
    
    if (!admin || admin.password !== currentPassword) {
        showToast('❌ 当前密码错误', 'error', 3000);
        return;
    }
    
    admin.password = newPassword;
    localStorage.setItem('admins', JSON.stringify(admins));
    
    closeChangePasswordModal();
    showToast('✓ 密码修改成功', 'success', 2500);
}

// 格式化日期
function formatDate(isoString) {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// OpenClaw API 接口调用
window.openclawAPI = {
    getApplications: async () => {
        const apps = JSON.parse(localStorage.getItem('applications') || '[]');
        return apps;
    },
    
    getStats: async () => {
        const apps = JSON.parse(localStorage.getItem('applications') || '[]');
        return {
            total: apps.length,
            today: apps.filter(a => new Date(a.submitTime).toDateString() === new Date().toDateString()).length
        };
    },
    
    exportData: async () => {
        return JSON.parse(localStorage.getItem('applications') || '[]');
    }
};
