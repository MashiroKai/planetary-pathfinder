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
    
    // 动画显示
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });
    
    // 自动隐藏
    if (duration > 0) {
        setTimeout(() => hideToast(toast), duration);
    }
    
    return toast;
}

function hideToast(toast) {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 300);
}

// ===== 确认对话框系统 =====
let confirmCallback = null;

function initConfirmDialog() {
    const overlay = document.getElementById('confirmOverlay');
    const cancelBtn = document.getElementById('confirmCancel');
    const okBtn = document.getElementById('confirmOk');
    
    if (!overlay) return;
    
    cancelBtn.addEventListener('click', () => {
        hideConfirmDialog();
    });
    
    okBtn.addEventListener('click', () => {
        if (confirmCallback) {
            confirmCallback();
        }
        hideConfirmDialog();
    });
    
    // 点击遮罩关闭
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            hideConfirmDialog();
        }
    });
}

function showConfirmDialog(title, message, callback, type = 'warning') {
    const overlay = document.getElementById('confirmOverlay');
    const iconEl = document.getElementById('confirmIcon');
    const titleEl = document.getElementById('confirmTitle');
    const messageEl = document.getElementById('confirmMessage');
    
    confirmCallback = callback;
    
    // 设置图标
    if (type === 'danger') {
        iconEl.className = 'confirm-icon danger';
        iconEl.textContent = '🗑️';
    } else {
        iconEl.className = 'confirm-icon warning';
        iconEl.textContent = '⚠️';
    }
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    
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

// 加载仪表板
async function loadDashboard() {
    const user = localStorage.getItem('adminUser');
    if (user) {
        document.getElementById('welcomeUser').textContent = `欢迎，${user}`;
    }
    await loadApplications();
    await loadAdmins();
    updateStats();
}

// 加载申请数据
async function loadApplications() {
    // 优先从云端获取
    if (typeof CloudStorage !== 'undefined' && CloudStorage.isAvailable()) {
        const cloudApps = await CloudStorage.getApplications();
        if (cloudApps) {
            renderApplications(cloudApps);
            return;
        }
    }
    
    // 从 API 获取
    try {
        const res = await fetch('/api/admin/applications');
        const data = await res.json();
        renderApplications(data.applications || []);
        return;
    } catch (err) {}
    
    // 降级到本地存储
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
        const appId = app.id || index;  // 云端 ID 或本地索引
        html += `
            <tr>
                <td>${app.name || '-'}</td>
                <td>${app.college || '-'}</td>
                <td>${app.major || '-'}</td>
                <td>${app.grade || '-'}</td>
                <td>${app.email || '-'}</td>
                <td>${app.phone || '-'}</td>
                <td>${formatDate(app.submitTime)}</td>
                <td>
                    <button class="btn-action btn-secondary" style="padding:5px 10px;font-size:12px;background:#dc3545;border-color:#dc3545;" onclick="deleteApplication(${index}, ${appId})">🗑️ 删除</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// 加载管理员列表
async function loadAdmins() {
    try {
        const res = await fetch('/api/admin/admins');
        const data = await res.json();
        renderAdmins(data.admins || []);
    } catch (err) {
        // 演示模式：检查是否已有管理员，没有则创建默认账号（静默，不显示提示）
        let admins = JSON.parse(localStorage.getItem('admins') || '[]');
        if (admins.length === 0) {
            admins = [{
                username: 'admin',
                password: 'admin123',
                createdAt: new Date().toISOString()
            }];
            localStorage.setItem('admins', JSON.stringify(admins));
        }
        renderAdmins(admins);
    }
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
    
    admins.forEach((admin, index) => {
        html += `
            <tr>
                <td>${admin.username}</td>
                <td>${formatDate(admin.createdAt)}</td>
                <td>
                    ${admin.username !== 'admin' ? `<button class="btn-action btn-secondary" style="padding:5px 10px;font-size:12px;" onclick="deleteAdmin('${admin.username}')">删除</button>` : '-'}
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// 更新统计
function updateStats() {
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
function refreshData() {
    loadApplications();
    loadAdmins();
    updateStats();
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

// 添加管理员
async function handleAddAdmin(event) {
    event.preventDefault();
    
    const username = document.getElementById('newAdminUsername').value;
    const password = document.getElementById('newAdminPassword').value;
    
    // 优先使用云端添加
    if (typeof CloudStorage !== 'undefined' && CloudStorage.isAvailable()) {
        const result = await CloudStorage.addAdmin(username, password);
        if (result.success) {
            showToast('✓ 管理员添加成功', 'success', 2500);
            closeAddAdminModal();
            loadAdmins();
            return;
        } else {
            showToast(result.error?.message || '添加失败', 'error', 3000);
            return;
        }
    }
    
    // 尝试 API
    try {
        const res = await fetch('/api/admin/admins', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        
        if (data.success) {
            showToast('✓ 管理员添加成功', 'success', 2500);
            closeAddAdminModal();
            loadAdmins();
            return;
        } else {
            showToast(data.message || '添加失败', 'error', 3000);
            return;
        }
    } catch (err) {}
    
    // 降级到本地存储
    const admins = JSON.parse(localStorage.getItem('admins') || '[]');
    if (admins.some(a => a.username === username)) {
        showToast('用户名已存在', 'error', 3000);
        return;
    }
    admins.push({ username, password, createdAt: new Date().toISOString() });
    localStorage.setItem('admins', JSON.stringify(admins));
    
    showToast('✓ 管理员添加成功', 'success', 2500);
    closeAddAdminModal();
    loadAdmins();
}

// 删除管理员
async function deleteAdmin(username) {
    showConfirmDialog(
        '删除管理员',
        `确定要删除管理员 "${username}" 吗？此操作不可恢复。`,
        async () => {
            try {
                const res = await fetch(`/api/admin/admins/${encodeURIComponent(username)}`, {
                    method: 'DELETE'
                });
                const data = await res.json();
                
                if (data.success) {
                    showToast('✓ 管理员已删除', 'success', 2000);
                    loadAdmins();
                } else {
                    showToast(data.message || '删除失败', 'error', 3000);
                }
            } catch (err) {
                // 演示模式
                let admins = JSON.parse(localStorage.getItem('admins') || '[]');
                admins = admins.filter(a => a.username !== username);
                localStorage.setItem('admins', JSON.stringify(admins));
                
                showToast('✓ 管理员已删除', 'success', 2000);
                loadAdmins();
            }
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

// 删除申请
async function deleteApplication(index, appId) {
    showConfirmDialog(
        '删除申请信息',
        '确定要删除这条申请信息吗？此操作不可恢复。',
        async () => {
            // 优先从云端删除
            if (typeof CloudStorage !== 'undefined' && CloudStorage.isAvailable() && appId) {
                const result = await CloudStorage.deleteApplication(appId);
                if (result.success) {
                    showToast('✓ 申请已删除', 'success', 2000);
                    loadApplications();
                    updateStats();
                    return;
                }
            }
            
            // 降级到本地删除
            const applications = JSON.parse(localStorage.getItem('applications') || '[]');
            applications.splice(index, 1);
            localStorage.setItem('applications', JSON.stringify(applications));
            
            showToast('✓ 申请已删除', 'success', 2000);
            loadApplications();
            updateStats();
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

// 修改密码
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
    
    // 优先使用云端修改密码
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
    
    // 降级到本地验证和修改
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
    // 获取所有申请
    getApplications: async () => {
        const apps = JSON.parse(localStorage.getItem('applications') || '[]');
        return apps;
    },
    
    // 获取统计数据
    getStats: async () => {
        const apps = JSON.parse(localStorage.getItem('applications') || '[]');
        return {
            total: apps.length,
            today: apps.filter(a => new Date(a.submitTime).toDateString() === new Date().toDateString()).length
        };
    },
    
    // 导出数据
    exportData: async () => {
        return JSON.parse(localStorage.getItem('applications') || '[]');
    }
};
