// 页面映射
const pageMap = {
    'home': 'index.html',
    'project': 'project.html',
    'school': 'school.html',
    'staff': 'staff.html'
};

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

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    checkLoginStatus();
    // 加载学校列表
    loadSchoolList();
    // 设置导航链接点击事件
    setupNavLinks();
});

// 检查登录状态
function checkLoginStatus() {
    const user = localStorage.getItem('user');
    if (!user) {
        // 未登录时隐藏添加按钮
        document.querySelector('.add-school-btn').style.display = 'none';
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
    if (!currentUser.permissions.includes('school')) {
        alert('您没有权限访问此页面');
        window.location.href = 'index.html';
        return;
    }

    // 更新用户信息显示
    document.getElementById('currentUser').textContent = `${userInfo.username} (${userInfo.roleName})`;
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

// 加载学校列表
function loadSchoolList(page = 1) {
    // 模拟从后端获取数据
    const schoolList = [
        {
            id: 1,
            name: '北京市第一实验小学',
            type: '小学',
            area: '东城区',
            studentCount: 1200,
            contactName: '张校长',
            contactPhone: '13800138000',
            address: '北京市东城区东直门大街1号',
            status: 'active'
        },
        {
            id: 2,
            name: '北京市第二中学',
            type: '初中',
            area: '西城区',
            studentCount: 1500,
            contactName: '李校长',
            contactPhone: '13800138001',
            address: '北京市西城区西直门大街2号',
            status: 'active'
        },
        {
            id: 3,
            name: '北京市第三幼儿园',
            type: '幼儿园',
            area: '朝阳区',
            studentCount: 300,
            contactName: '王园长',
            contactPhone: '13800138002',
            address: '北京市朝阳区朝阳门大街3号',
            status: 'active'
        }
    ];

    // 更新统计数据
    updateStatistics(schoolList);

    // 渲染学校列表
    renderSchoolList(schoolList);

    // 更新分页
    updatePagination(page, 10); // 假设总页数为10
}

// 更新统计数据
function updateStatistics(schoolList) {
    const totalSchools = schoolList.length;
    const totalStudents = schoolList.reduce((sum, school) => sum + school.studentCount, 0);
    const screenedStudents = Math.floor(totalStudents * 0.8); // 假设80%的学生已筛查
    const activeProjects = schoolList.filter(school => school.status === 'active').length;

    document.getElementById('totalSchools').textContent = totalSchools;
    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('screenedStudents').textContent = screenedStudents;
    document.getElementById('activeProjects').textContent = activeProjects;
}

// 渲染学校列表
function renderSchoolList(schoolList) {
    const schoolListContainer = document.getElementById('schoolList');
    schoolListContainer.innerHTML = '';

    schoolList.forEach(school => {
        const card = createSchoolCard(school);
        schoolListContainer.appendChild(card);
    });
}

// 创建学校卡片
function createSchoolCard(school) {
    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4 mb-4';
    card.innerHTML = `
        <div class="card school-card h-100">
            <div class="card-body">
                <h5 class="card-title">${school.name}</h5>
                <div class="school-info">
                    <p><strong>类型：</strong>${school.type}</p>
                    <p><strong>区域：</strong>${school.area}</p>
                    <p><strong>学生数：</strong>${school.studentCount}</p>
                    <p><strong>联系人：</strong>${school.contactName}</p>
                    <p><strong>联系电话：</strong>${school.contactPhone}</p>
                    <p><strong>地址：</strong>${school.address}</p>
                </div>
                <div class="d-flex justify-content-end mt-3">
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="editSchool(${school.id})">
                        <i class="bi bi-pencil"></i> 编辑
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteSchool(${school.id})">
                        <i class="bi bi-trash"></i> 删除
                    </button>
                </div>
            </div>
        </div>
    `;
    return card;
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
            loadSchoolList(currentPage - 1);
        }
    });
    pagination.appendChild(prevLi);

    // 添加页码按钮
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        li.addEventListener('click', () => loadSchoolList(i));
        pagination.appendChild(li);
    }

    // 添加下一页按钮
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = '<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>';
    nextLi.addEventListener('click', () => {
        if (currentPage < totalPages) {
            loadSchoolList(currentPage + 1);
        }
    });
    pagination.appendChild(nextLi);
}

// 应用筛选
function applyFilters() {
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const areaFilter = document.getElementById('areaFilter').value;
    const typeFilter = document.getElementById('typeFilter').value;

    // 这里应该调用后端API进行搜索和筛选
    // 目前使用模拟数据
    loadSchoolList();
}

// 保存学校
function saveSchool() {
    const form = document.getElementById('schoolForm');
    const formData = new FormData(form);
    const schoolData = Object.fromEntries(formData.entries());

    // 这里应该调用后端API保存学校
    console.log('保存学校:', schoolData);

    // 关闭模态框
    const modal = bootstrap.Modal.getInstance(document.getElementById('schoolModal'));
    modal.hide();

    // 刷新学校列表
    loadSchoolList();
}

// 编辑学校
function editSchool(id) {
    // 这里应该调用后端API获取学校信息
    const school = {
        id: id,
        name: '北京市第一实验小学',
        type: '小学',
        area: '东城区',
        studentCount: 1200,
        contactName: '张校长',
        contactPhone: '13800138000',
        address: '北京市东城区东直门大街1号'
    };

    // 填充表单
    document.getElementById('schoolName').value = school.name;
    document.getElementById('schoolType').value = school.type;
    document.getElementById('schoolArea').value = school.area;
    document.getElementById('studentCount').value = school.studentCount;
    document.getElementById('contactName').value = school.contactName;
    document.getElementById('contactPhone').value = school.contactPhone;
    document.getElementById('schoolAddress').value = school.address;

    // 显示模态框
    const modal = new bootstrap.Modal(document.getElementById('schoolModal'));
    modal.show();
}

// 删除学校
function deleteSchool(id) {
    if (confirm('确定要删除这所学校吗？')) {
        // 这里应该调用后端API删除学校
        console.log('删除学校:', id);
        
        // 刷新学校列表
        loadSchoolList();
    }
}

// 退出登录
function logout() {
    // 清除用户会话
    localStorage.removeItem('user');
    // 跳转到首页
    window.location.href = 'index.html';
}
