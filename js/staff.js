// 页面映射
const pageMap = {
    'home': 'index.html',
    'project': 'project.html',
    'school': 'school.html',
    'staff': 'staff.html'
};

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    checkLoginStatus();
    // 加载人员列表
    loadStaffList();
    // 绑定搜索和筛选事件
    bindSearchEvents();
    // 设置导航链接点击事件
    setupNavLinks();
});

// 检查登录状态
function checkLoginStatus() {
    const user = localStorage.getItem('user');
    if (!user) {
        // 未登录时隐藏添加按钮
        document.querySelector('.add-staff-btn').style.display = 'none';
        // 未登录时跳转到首页
        window.location.href = 'index.html';
        return;
    }

    const userInfo = JSON.parse(user);
    const currentUser = mockUsers[userInfo.username];
    if (!currentUser) {
        // 用户信息错误，跳转到首页
        window.location.href = 'index.html';
        return;
    }

    // 检查是否有权限访问此页面
    if (!currentUser.permissions.includes('staff')) {
        alert('您没有权限访问此页面');
        window.location.href = 'index.html';
        return;
    }

    // 更新用户信息显示
    document.getElementById('currentUser').textContent = `${userInfo.username} (${userInfo.roleName})`;
}

// 模拟账号数据
const mockUsers = {
    'admin': {
        id: 1,
        username: 'admin',
        password: '123456',
        role: '管理员',
        roleName: '管理员',
        permissions: ['home', 'project', 'school', 'staff'] // 所有权限
    },
    '13088021301': {
        id: 2,
        username: '13088021301',
        password: '021301',
        role: '机构',
        roleName: '筛查机构',
        permissions: ['home', 'project', 'staff'] // 首页、项目筛查管理、筛查人员管理
    },
    '18011130177': {
        id: 3,
        username: '18011130177',
        password: '130177',
        role: '学校',
        roleName: '学校',
        permissions: ['home', 'school'] // 首页、筛查学校管理
    },
    '15756216089': {
        id: 4,
        username: '15756216089',
        password: '216089',
        role: '筛查队长',
        roleName: '筛查队长',
        permissions: ['home', 'staff'] // 首页、筛查人员管理
    }
};

// 加载人员列表
function loadStaffList(page = 1) {
    // 模拟从后端获取数据
    const staffList = [
        {
            id: 1,
            name: '张三',
            role: '验光师',
            idCard: '110101199001011234',
            phone: '13800138000',
            certificate: '高级验光师',
            status: 'active',
            remark: '经验丰富'
        },
        {
            id: 2,
            name: '李四',
            role: '护士',
            idCard: '110101199001021234',
            phone: '13800138001',
            certificate: '护士资格证',
            status: 'busy',
            remark: '擅长儿童视力检查'
        },
        {
            id: 3,
            name: '王五',
            role: '医生',
            idCard: '110101199001031234',
            phone: '13800138002',
            certificate: '医师资格证',
            status: 'off',
            remark: '眼科专家'
        }
    ];

    // 更新统计数据
    updateStatistics(staffList);

    // 渲染人员列表
    renderStaffList(staffList);

    // 更新分页
    updatePagination(page, 10); // 假设总页数为10
}

// 更新统计数据
function updateStatistics(staffList) {
    const total = staffList.length;
    const active = staffList.filter(staff => staff.status === 'active').length;
    const qualified = staffList.filter(staff => staff.certificate).length;
    const busy = staffList.filter(staff => staff.status === 'busy').length;

    document.getElementById('totalStaff').textContent = total;
    document.getElementById('activeStaff').textContent = active;
    document.getElementById('qualifiedStaff').textContent = qualified;
    document.getElementById('busyStaff').textContent = busy;
}

// 渲染人员列表
function renderStaffList(staffList) {
    const staffListContainer = document.getElementById('staffList');
    staffListContainer.innerHTML = '';

    staffList.forEach(staff => {
        const card = createStaffCard(staff);
        staffListContainer.appendChild(card);
    });
}

// 创建人员卡片
function createStaffCard(staff) {
    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4';
    card.innerHTML = `
        <div class="staff-card">
            <div class="card-header">
                <h5 class="mb-0">${staff.name}</h5>
            </div>
            <div class="card-body">
                <div class="staff-info">
                    <p><strong>角色：</strong>${staff.role}</p>
                    <p><strong>身份证号：</strong>${staff.idCard}</p>
                    <p><strong>联系电话：</strong>${staff.phone}</p>
                    <p><strong>资格证书：</strong>${staff.certificate}</p>
                    <p><strong>备注：</strong>${staff.remark}</p>
                </div>
                <div class="staff-status ${getStatusClass(staff.status)}">
                    ${getStatusText(staff.status)}
                </div>
            </div>
        </div>
    `;
    return card;
}

// 获取状态样式类
function getStatusClass(status) {
    switch(status) {
        case 'active':
            return 'status-active';
        case 'busy':
            return 'status-busy';
        case 'off':
            return 'status-off';
        default:
            return '';
    }
}

// 获取状态文本
function getStatusText(status) {
    switch(status) {
        case 'active':
            return '在岗';
        case 'busy':
            return '忙碌';
        case 'off':
            return '休息';
        default:
            return '';
    }
}

// 绑定搜索和筛选事件
function bindSearchEvents() {
    const searchInput = document.getElementById('searchInput');
    const roleFilter = document.getElementById('roleFilter');
    const statusFilter = document.getElementById('statusFilter');

    searchInput.addEventListener('input', handleSearch);
    roleFilter.addEventListener('change', handleSearch);
    statusFilter.addEventListener('change', handleSearch);
}

// 处理搜索和筛选
function handleSearch() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const roleFilter = document.getElementById('roleFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    // 这里应该调用后端API进行搜索和筛选
    // 目前使用模拟数据
    loadStaffList();
}

// 更新分页
function updatePagination(currentPage, totalPages) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    // 添加上一页按钮
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = '<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>';
    prevLi.addEventListener('click', () => {
        if (currentPage > 1) {
            loadStaffList(currentPage - 1);
        }
    });
    pagination.appendChild(prevLi);

    // 添加页码按钮
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        li.addEventListener('click', () => loadStaffList(i));
        pagination.appendChild(li);
    }

    // 添加下一页按钮
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = '<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>';
    nextLi.addEventListener('click', () => {
        if (currentPage < totalPages) {
            loadStaffList(currentPage + 1);
        }
    });
    pagination.appendChild(nextLi);
}

// 添加新人员
function addStaff() {
    const form = document.getElementById('staffForm');
    const formData = new FormData(form);
    const staffData = Object.fromEntries(formData.entries());

    // 这里应该调用后端API添加人员
    console.log('添加人员:', staffData);

    // 关闭模态框
    const modal = bootstrap.Modal.getInstance(document.getElementById('staffModal'));
    modal.hide();

    // 刷新人员列表
    loadStaffList();
}

// 重置表单
function resetForm() {
    document.getElementById('staffForm').reset();
}

// 设置导航链接点击事件
function setupNavLinks() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.onclick = (e) => {
            const href = link.getAttribute('href');
            if (href === 'index.html') return true; // 首页始终可以访问
            
            e.preventDefault();
            checkPageAccess(href);
        };
    });
}

// 检查页面访问权限
function checkPageAccess(href) {
    const user = localStorage.getItem('user');
    if (!user) {
        showMessage('请先登录后再访问');
        return;
    }

    const userInfo = JSON.parse(user);
    const page = Object.keys(pageMap).find(key => pageMap[key] === href);
    
    // 从mockUsers中获取当前用户的权限
    const currentUser = mockUsers[userInfo.username];
    if (!currentUser) {
        showMessage('用户信息错误');
        return;
    }

    if (currentUser.permissions.includes(page)) {
        // 有权限，在当前页面打开
        window.location.href = href;
    } else {
        showMessage('您没有权限访问此页面');
    }
}

// 显示消息提示
function showMessage(message) {
    // 创建消息提示元素
    const messageDiv = document.createElement('div');
    messageDiv.className = 'alert alert-warning alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    messageDiv.style.zIndex = '9999';
    messageDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // 添加到页面
    document.body.appendChild(messageDiv);
    
    // 3秒后自动消失
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
} 