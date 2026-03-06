// ===== 管理后台脚本 =====

// 检查登录状态
if (!localStorage.getItem('adminToken')) {
    window.location.href = 'admin.html';
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
});

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
    try {
        const res = await fetch('/api/admin/applications');
        const data = await res.json();
        renderApplications(data.applications || []);
    } catch (err) {
        // 演示模式：使用本地存储
        const apps = JSON.parse(localStorage.getItem('applications') || '[]');
        renderApplications(apps);
    }
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
                </tr>
            </thead>
            <tbody>
    `;
    
    applications.forEach(app => {
        html += `
            <tr>
                <td>${app.name || '-'}</td>
                <td>${app.college || '-'}</td>
                <td>${app.major || '-'}</td>
                <td>${app.grade || '-'}</td>
                <td>${app.email || '-'}</td>
                <td>${app.phone || '-'}</td>
                <td>${formatDate(app.submitTime)}</td>
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
        // 演示模式
        const admins = JSON.parse(localStorage.getItem('admins') || '[{"username":"admin","createdAt":"' + new Date().toISOString() + '"}]');
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
    alert('数据已刷新');
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
    document.getElementById('addAdminModal').style.display = 'flex';
}

// 关闭添加管理员模态框
function closeAddAdminModal() {
    document.getElementById('addAdminModal').style.display = 'none';
    document.getElementById('newAdminUsername').value = '';
    document.getElementById('newAdminPassword').value = '';
}

// 添加管理员
async function handleAddAdmin(event) {
    event.preventDefault();
    
    const username = document.getElementById('newAdminUsername').value;
    const password = document.getElementById('newAdminPassword').value;
    
    try {
        const res = await fetch('/api/admin/admins', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        
        if (data.success) {
            alert('管理员添加成功');
            closeAddAdminModal();
            loadAdmins();
        } else {
            alert(data.message || '添加失败');
        }
    } catch (err) {
        // 演示模式
        const admins = JSON.parse(localStorage.getItem('admins') || '[]');
        admins.push({ username, password, createdAt: new Date().toISOString() });
        localStorage.setItem('admins', JSON.stringify(admins));
        
        alert('管理员添加成功');
        closeAddAdminModal();
        loadAdmins();
    }
}

// 删除管理员
async function deleteAdmin(username) {
    if (!confirm(`确定要删除管理员 "${username}" 吗？`)) return;
    
    try {
        const res = await fetch(`/api/admin/admins/${encodeURIComponent(username)}`, {
            method: 'DELETE'
        });
        const data = await res.json();
        
        if (data.success) {
            loadAdmins();
        } else {
            alert(data.message || '删除失败');
        }
    } catch (err) {
        // 演示模式
        let admins = JSON.parse(localStorage.getItem('admins') || '[]');
        admins = admins.filter(a => a.username !== username);
        localStorage.setItem('admins', JSON.stringify(admins));
        
        loadAdmins();
    }
}

// 退出登录
function handleLogout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    window.location.href = 'admin.html';
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
