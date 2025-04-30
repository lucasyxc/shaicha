// 全局变量
let projects = [];
let areas = [];
let leaders = [];
let currentPage = 1;
const itemsPerPage = 10;

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

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查登录状态
    checkLoginStatus();
    // 设置导航链接点击事件
    setupNavLinks();
    initializeData();
    setupEventListeners();
});

// 初始化数据
async function initializeData() {
    try {
        const response = await fetch('../data/projects.json');
        if (!response.ok) throw new Error('加载数据失败');
        const data = await response.json();
        
        // 存储数据到全局变量
        projects = data.projects;
        areas = data.areas;
        leaders = data.leaders;
        
        updateStatistics();
        displayProjects();
    } catch (error) {
        showError('初始化数据失败：' + error.message);
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 项目名称生成相关
    document.getElementById('projectYear').addEventListener('input', function(e) {
        // 只允许输入数字
        this.value = this.value.replace(/[^\d]/g, '');
        // 限制4位数字
        if (this.value.length > 4) {
            this.value = this.value.slice(0, 4);
        }
    });
    document.getElementById('projectTerm').addEventListener('change', generateProjectName);
    document.getElementById('schoolName').addEventListener('input', generateProjectName);
    
    // 搜索和筛选
    document.getElementById('searchInput').addEventListener('input', debounce(applyFilters, 300));
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('dateFilter').addEventListener('change', applyFilters);
    
    // 表单验证
    document.getElementById('startDate').addEventListener('change', validateDates);
    document.getElementById('endDate').addEventListener('change', validateDates);
}

// 加载归属区域选项
async function loadAreas() {
    try {
        const response = await fetch('../data/projects.json');
        if (!response.ok) throw new Error('加载区域数据失败');
        const data = await response.json();
        areas = data.areas;
        
        const select = document.getElementById('projectArea');
        select.innerHTML = '<option value="">请选择归属区域</option>' + 
            areas.map(area => `<option value="${area.id}">${area.name}</option>`).join('');
    } catch (error) {
        showError('加载区域数据失败：' + error.message);
    }
}

// 加载项目负责人选项
async function loadProjectLeaders() {
    try {
        const response = await fetch('../data/projects.json');
        if (!response.ok) throw new Error('加载负责人数据失败');
        const data = await response.json();
        leaders = data.leaders;
        
        const select = document.getElementById('projectLeader');
        select.innerHTML = '<option value="">请选择项目负责人</option>' + 
            leaders.map(leader => `<option value="${leader.id}">${leader.name} (${leader.title})</option>`).join('');
    } catch (error) {
        showError('加载负责人数据失败：' + error.message);
    }
}

// 设置年级选项
function setupGradeOptions() {
    const grades = [
        { value: 1, label: '一年级' },
        { value: 2, label: '二年级' },
        { value: 3, label: '三年级' },
        { value: 4, label: '四年级' },
        { value: 5, label: '五年级' },
        { value: 6, label: '六年级' },
        { value: 7, label: '初一' },
        { value: 8, label: '初二' },
        { value: 9, label: '初三' }
    ];
    
    const container = document.getElementById('targetGrades');
    container.innerHTML = grades.map(grade => `
        <div class="col-auto">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="${grade.value}" id="grade_${grade.value}">
                <label class="form-check-label" for="grade_${grade.value}">${grade.label}</label>
            </div>
        </div>
    `).join('');
}

// 更新统计数据
function updateStatistics() {
    document.getElementById('totalProjects').textContent = projects.length;
    document.getElementById('activeProjects').textContent = 
        projects.filter(p => p.status === 'active').length;
    document.getElementById('completedProjects').textContent = 
        projects.filter(p => p.status === 'completed').length;
    
    const totalScreened = projects.reduce((sum, project) => 
        sum + (project.screenedCount || 0), 0);
    document.getElementById('totalScreened').textContent = totalScreened;
}

// 获取项目状态
function getProjectStatus(project) {
    const today = new Date();
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    
    if (project.progress === 100) {
        return { text: '已完成', class: 'completed' };
    } else if (today < startDate) {
        return { text: '待开始', class: 'pending' };
    } else if (today >= startDate && today <= endDate) {
        return { text: '进行中', class: 'active' };
    } else {
        return { text: '已完成', class: 'completed' };
    }
}

// 显示项目列表
function displayProjects() {
    const filteredProjects = filterProjects();
    const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageProjects = filteredProjects.slice(start, end);
    
    const tbody = document.getElementById('projectList');
    tbody.innerHTML = pageProjects.map(project => {
        const status = getProjectStatus(project);
        // 获取区域名称和负责人信息
        const area = areas.find(a => a.id === project.areaId)?.name || '-';
        const leader = leaders.find(l => l.id === project.leaderId)?.name || '-';
        
        return `
            <tr>
                <td>${project.name}</td>
                <td><span class="status-badge ${status.class}">${status.text}</span></td>
                <td>${formatDate(project.startDate)}</td>
                <td>${formatDate(project.endDate)}</td>
                <td>${area}</td>
                <td>${leader}</td>
                <td>
                    <div class="progress">
                        <div class="progress-bar" role="progressbar" style="width: ${project.progress}%">
                            ${project.progress}%
                        </div>
                    </div>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editProject(${project.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteProject(${project.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    updatePagination(totalPages);
}

// 过滤项目
function filterProjects() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    return projects.filter(project => {
        const matchesSearch = project.name.toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilter || project.status === statusFilter;
        const matchesDate = !dateFilter || 
            (project.startDate <= dateFilter && project.endDate >= dateFilter);
        
        return matchesSearch && matchesStatus && matchesDate;
    });
}

// 应用过滤器
function applyFilters() {
    currentPage = 1;
    displayProjects();
}

// 更新分页
function updatePagination(totalPages) {
    const pagination = document.getElementById('pagination');
    let html = '';
    
    if (totalPages > 1) {
        html += `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">上一页</a>
            </li>
        `;
        
        for (let i = 1; i <= totalPages; i++) {
            html += `
                <li class="page-item ${currentPage === i ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
                </li>
            `;
        }
        
        html += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">下一页</a>
            </li>
        `;
    }
    
    pagination.innerHTML = html;
}

// 切换页面
function changePage(page) {
    if (page < 1) return;
    currentPage = page;
    displayProjects();
}

// 自动生成项目名称
function generateProjectName() {
    const year = document.getElementById('projectYear').value;
    const term = document.getElementById('projectTerm').value;
    const school = document.getElementById('schoolName').value;
    
    if (year && term && school) {
        return `${year}-${term}-${school}`;
    }
    return '';
}

// 保存项目
async function saveProject() {
    if (!validateForm()) return;
    
    const formData = {
        id: projects.length + 1,
        name: generateProjectName(),
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        area: document.getElementById('projectArea').value,
        leader: document.getElementById('projectLeader').value,
        schoolContact: {
            name: document.getElementById('schoolContactName').value,
            phone: document.getElementById('schoolContactPhone').value
        },
        screeningItems: Array.from(document.querySelectorAll('#screeningItems input:checked'))
            .map(input => input.value),
        grades: Array.from(document.querySelectorAll('#targetGrades input:checked'))
            .map(input => parseInt(input.value)),
        status: 'pending',
        screenedCount: 0,
        progress: 0
    };
    
    try {
        // 在实际应用中，这里应该是一个POST请求
        // 现在我们只是更新本地数据
        projects.unshift(formData);
        displayProjects();
        updateStatistics();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('projectModal'));
        modal.hide();
        showSuccess('项目保存成功');
        
        // 清空表单
        document.getElementById('projectForm').reset();
    } catch (error) {
        showError('保存项目失败：' + error.message);
    }
}

// 编辑项目
function editProject(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    // 解析项目名称
    const [year, term, school] = project.name.split('-');
    document.getElementById('projectYear').value = year;
    document.getElementById('projectTerm').value = term;
    document.getElementById('schoolName').value = school;
    
    document.getElementById('startDate').value = project.startDate;
    document.getElementById('endDate').value = project.endDate;
    document.getElementById('projectArea').value = project.areaId;
    document.getElementById('projectLeader').value = project.leaderId;
    
    if (project.schoolContact) {
        document.getElementById('schoolContactName').value = project.schoolContact.name;
        document.getElementById('schoolContactPhone').value = project.schoolContact.phone;
    }
    
    // 设置选中的筛查项目
    project.screeningItems.forEach(item => {
        document.getElementById(`item_${item}`).checked = true;
    });
    
    // 设置选中的年级
    project.grades.forEach(grade => {
        document.getElementById(`grade_${grade}`).checked = true;
    });
    
    document.getElementById('modalTitle').textContent = '编辑项目';
    new bootstrap.Modal(document.getElementById('projectModal')).show();
}

// 删除项目
async function deleteProject(projectId) {
    if (!confirm('确定要删除这个项目吗？')) return;
    
    try {
        // 在实际应用中，这里应该是一个DELETE请求
        // 现在我们只是更新本地数据
        const index = projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
            projects.splice(index, 1);
            displayProjects();
            updateStatistics();
            showSuccess('项目删除成功');
        }
    } catch (error) {
        showError('删除项目失败：' + error.message);
    }
}

// 表单验证
function validateForm() {
    const form = document.getElementById('projectForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return false;
    }

    // 验证年份格式
    const year = document.getElementById('projectYear').value;
    if (!/^\d{4}$/.test(year)) {
        showError('请输入正确的4位年份');
        return false;
    }

    // 验证至少选择一个年级
    const selectedGrades = document.querySelectorAll('#targetGrades input:checked');
    if (selectedGrades.length === 0) {
        showError('请至少选择一个目标年级');
        return false;
    }

    // 验证至少选择一个筛查项目
    const selectedItems = document.querySelectorAll('#screeningItems input:checked');
    if (selectedItems.length === 0) {
        showError('请至少选择一个筛查项目');
        return false;
    }

    return true;
}

// 日期验证
function validateDates() {
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    
    if (startDate.value && endDate.value && startDate.value > endDate.value) {
        endDate.setCustomValidity('结束日期不能早于开始日期');
    } else {
        endDate.setCustomValidity('');
    }
}

// 工具函数
function getStatusText(status) {
    const statusMap = {
        'pending': '待开始',
        'active': '进行中',
        'completed': '已完成',
        'cancelled': '已取消'
    };
    return statusMap[status] || status;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('zh-CN');
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function showSuccess(message) {
    // 实现成功提示
    alert(message);
}

function showError(message) {
    // 实现错误提示
    alert(message);
}

// 检查登录状态
function checkLoginStatus() {
    const user = localStorage.getItem('user');
    if (!user) {
        // 未登录，跳转到首页
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

// 退出登录
function logout() {
    // 清除用户会话
    localStorage.removeItem('user');
    // 跳转到首页
    window.location.href = 'index.html';
} 