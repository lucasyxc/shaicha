// 登录状态检查
function checkLoginStatus() {
    const user = localStorage.getItem('user');
    if (user) {
        // 如果已登录，显示用户名和退出按钮
        const userInfo = JSON.parse(user);
        document.getElementById('currentUser').textContent = `${userInfo.username} (${userInfo.roleName})`;
        document.getElementById('userInfo').classList.remove('d-none');
        document.getElementById('loginButton').classList.add('d-none');
    } else {
        // 如果未登录，隐藏用户信息和退出按钮
        document.getElementById('userInfo').classList.add('d-none');
        document.getElementById('loginButton').classList.remove('d-none');
    }
}

// 更新UI显示
function updateUI(loginInfo) {
    const userInfo = document.getElementById('userInfo');
    const loginBtn = document.getElementById('loginBtn');
    const currentUser = document.getElementById('currentUser');
    
    if (loginInfo) {
        userInfo.classList.remove('d-none');
        loginBtn.classList.add('d-none');
        currentUser.textContent = `${loginInfo.username} (${loginInfo.roleName})`;
    } else {
        userInfo.classList.add('d-none');
        loginBtn.classList.remove('d-none');
    }
}

    // 页面映射
    const pageMap = {
    'home': 'index.html',
        'project': 'project.html',
        'school': 'school.html',
        'staff': 'staff.html'
    };

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 加载统计数据
    loadStatistics();
    // 加载政策新闻
    loadPolicyNews(1);
    // 加载知识科普
    loadKnowledge(1);
    // 加载通知公告
    loadNotices(1);
    // 检查登录状态
    checkLoginStatus();
    // 设置导航链接点击事件
    setupNavLinks();
});

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

// 数据统计相关功能
const STATS_CACHE_KEY = 'screening_stats_cache';
const CACHE_EXPIRY_TIME = 5 * 60 * 1000; // 5分钟缓存过期

// 模拟后端数据
const mockStatsData = {
    total_students: 12345,
    total_schools: 89,
    total_screening_staff: 156
};

// 获取统计数据
async function fetchScreeningStats() {
    try {
        // 检查缓存
        const cachedData = getCachedStats();
        if (cachedData) {
            return cachedData;
        }

        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 500));

        // 模拟API响应
        const response = {
            status: 200,
            data: mockStatsData
        };

        if (response.status === 200) {
            // 保存到缓存
            cacheStats(response.data);
            return response.data;
        } else {
            throw new Error('数据加载失败');
        }
    } catch (error) {
        console.error('获取统计数据失败:', error);
        // 如果缓存中有数据，返回缓存数据
        const cachedData = getCachedStats();
        if (cachedData) {
            return cachedData;
        }
        // 如果缓存也没有，返回默认值
        return {
            total_students: 0,
            total_schools: 0,
            total_screening_staff: 0
        };
    }
}

// 获取缓存数据
function getCachedStats() {
    const cached = localStorage.getItem('screening_stats_cache');
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const now = new Date().getTime();

    // 检查缓存是否过期（5分钟）
    if (now - timestamp > 5 * 60 * 1000) {
        localStorage.removeItem('screening_stats_cache');
        return null;
    }

    return data;
}

// 缓存数据
function cacheStats(data) {
    const cacheData = {
        data,
        timestamp: new Date().getTime()
    };
    localStorage.setItem('screening_stats_cache', JSON.stringify(cacheData));
}

// 更新统计数据显示
function updateStatsDisplay(stats) {
    // 更新学生总数
    const studentCount = document.querySelector('#stats .col-md-4:nth-child(2) h3.display-4');
    if (studentCount) studentCount.textContent = stats.total_students || 0;

    // 更新学校总数
    const schoolCount = document.querySelector('#stats .col-md-4:nth-child(3) h3.display-4');
    if (schoolCount) schoolCount.textContent = stats.total_schools || 0;

    // 更新筛查人员总数
    const staffCount = document.querySelector('#stats .col-md-4:nth-child(4) h3.display-4');
    if (staffCount) staffCount.textContent = stats.total_screening_staff || 0;
}

// 初始化统计数据
async function initStats() {
    try {
        const stats = await fetchScreeningStats();
        updateStatsDisplay(stats);
    } catch (error) {
        console.error('初始化统计数据失败:', error);
    }
}

// 加载统计数据
function loadStatistics() {
    // 这里应该从后端API获取实际数据
    // 目前使用模拟数据
    const statistics = {
        totalProjects: 12,
        totalStudents: 3560,
        totalSchools: 8,
        totalStaff: 15
    };

    // 更新统计数字
    document.getElementById('totalProjects').textContent = statistics.totalProjects;
    document.getElementById('totalStudents').textContent = statistics.totalStudents;
    document.getElementById('totalSchools').textContent = statistics.totalSchools;
    document.getElementById('totalStaff').textContent = statistics.totalStaff;
}

// 加载政策新闻
function loadPolicyNews(page) {
    fetch('assets/1.txt')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('policyNews');
            const pagination = document.getElementById('policyNewsPagination');
            container.innerHTML = '';
            pagination.innerHTML = '';
            
            // 计算总页数
            const totalPages = Math.ceil(data.length / 3);
            
            // 显示当前页的内容
            const startIndex = (page - 1) * 3;
            const endIndex = startIndex + 3;
            const currentPageData = data.slice(startIndex, endIndex);
            
            currentPageData.forEach(item => {
                const listItem = document.createElement('a');
                listItem.href = '#';
                listItem.className = 'list-group-item list-group-item-action';
                listItem.onclick = () => showDetail(item, '政策新闻');
                listItem.innerHTML = `
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">${item.title}</h6>
                        <small class="text-muted">${item.date}</small>
                    </div>
                    <p class="mb-1">${item.summary}</p>
                    <small class="text-${item.tagColor}">
                        <i class="bi bi-tag"></i> ${item.tag}
                    </small>
                `;
                container.appendChild(listItem);
            });
            
            // 创建分页器
            createPagination(pagination, page, totalPages, loadPolicyNews);
        })
        .catch(error => console.error('加载政策新闻失败:', error));
}

// 加载知识科普
async function loadKnowledge(page) {
    try {
        const response = await fetch('assets/2.txt');
        const data = await response.json();
        
        // 每页显示3条
        const itemsPerPage = 3;
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const items = data.slice(start, end);
        
        // 清空现有内容
        const container = document.getElementById('knowledgeList');
        container.innerHTML = '';
        
        // 添加新内容
        items.forEach(item => {
            const element = document.createElement('a');
            element.href = '#';
            element.className = 'list-group-item list-group-item-action';
            element.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${item.title}</h6>
                    <small class="text-muted">${item.date}</small>
                </div>
                <p class="mb-1">${item.summary}</p>
                <small class="text-muted">
                    <span class="badge bg-${item.tagColor}">${item.tag}</span>
                </small>
            `;
            element.onclick = (e) => {
                e.preventDefault();
                showDetail(item, 'knowledge');
            };
            container.appendChild(element);
        });
        
        // 更新分页
        const totalPages = Math.ceil(data.length / itemsPerPage);
        createPagination(document.getElementById('knowledgePagination'), page, totalPages, loadKnowledge);
    } catch (error) {
        console.error('加载知识科普失败:', error);
    }
}

// 加载通知公告
async function loadNotices(page) {
    try {
        const response = await fetch('assets/4.txt');
        const data = await response.json();
        
        // 每页显示3条
        const itemsPerPage = 3;
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const items = data.slice(start, end);
        
        // 清空现有内容
        const container = document.getElementById('noticesList');
        container.innerHTML = '';
        
        // 添加新内容
        items.forEach(item => {
            const element = document.createElement('a');
            element.href = '#';
            element.className = 'list-group-item list-group-item-action';
            element.innerHTML = `
                <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">${item.title}</h6>
                    <small class="text-muted">${item.date}</small>
                </div>
                <p class="mb-1">${item.summary}</p>
                <small class="text-muted">
                    <span class="badge bg-${item.tagColor}">${item.tag}</span>
                </small>
            `;
            element.onclick = (e) => {
                e.preventDefault();
                showDetail(item, 'notices');
            };
            container.appendChild(element);
        });
        
        // 更新分页
        const totalPages = Math.ceil(data.length / itemsPerPage);
        createPagination(document.getElementById('noticesPagination'), page, totalPages, loadNotices);
    } catch (error) {
        console.error('加载通知公告失败:', error);
    }
}

// 创建分页器
function createPagination(pagination, currentPage, totalPages, loadFunction) {
    // 添加上一页按钮
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" data-page="${currentPage - 1}">上一页</a>`;
    pagination.appendChild(prevLi);
    
    // 添加页码按钮
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
        pagination.appendChild(li);
    }
    
    // 添加下一页按钮
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" data-page="${currentPage + 1}">下一页</a>`;
    pagination.appendChild(nextLi);
    
    // 添加点击事件
    pagination.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target.tagName === 'A') {
            const page = parseInt(e.target.dataset.page);
            if (page >= 1 && page <= totalPages) {
                loadFunction(page);
            }
        }
    });
}

// 显示详情
function showDetail(item, type) {
    const modal = new bootstrap.Modal(document.getElementById('detailModal'));
    const title = document.getElementById('detailModalTitle');
    const content = document.getElementById('detailModalContent');
    
    title.textContent = item.title;
    
    let html = `
        <div class="mb-3">
            <span class="badge bg-${item.tagColor}">${item.tag}</span>
            <small class="text-muted ms-2">${item.date}</small>
        </div>
        <p class="lead">${item.summary}</p>
    `;
    
    if (item.fullContent) {
        html += `<p>${item.fullContent.introduction}</p>`;
        
        if (item.fullContent.sections) {
            item.fullContent.sections.forEach(section => {
                html += `
                    <h6 class="mt-4">${section.title}</h6>
                    <p>${section.content.replace(/\n/g, '<br>')}</p>
                `;
            });
        }
        
        if (item.fullContent.conclusion) {
            html += `<p class="mt-4">${item.fullContent.conclusion}</p>`;
        }
        
        if (item.fullContent.references && item.fullContent.references.length > 0) {
            html += `
                <h6 class="mt-4">参考资料</h6>
                <ul>
                    ${item.fullContent.references.map(ref => `<li>${ref}</li>`).join('')}
                </ul>
            `;
        }
    }
    
    content.innerHTML = html;
    modal.show();
}

// 退出登录
function logout() {
    // 清除用户会话
    localStorage.removeItem('user');
    // 刷新页面
    window.location.reload();
}

// 添加项目按钮点击事件
document.querySelector('.add-project-btn').addEventListener('click', function() {
    // 重置表单
    document.getElementById('projectForm').reset();
    // 显示模态框
    const modal = new bootstrap.Modal(document.getElementById('projectModal'));
    modal.show();
});

// 显示登录模态框
function showLoginModal() {
    const modal = new bootstrap.Modal(document.getElementById('loginModal'));
    document.getElementById('loginForm').reset();
    document.getElementById('loginError').classList.add('d-none');
    modal.show();
}

// 登录
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('loginError');

    // 验证用户名和密码
    if (!username || !password) {
        errorElement.textContent = '请输入用户名和密码';
        errorElement.classList.remove('d-none');
        return;
    }

    // 检查用户是否存在
    const user = mockUsers[username];
    if (!user) {
        errorElement.textContent = '用户名不存在';
        errorElement.classList.remove('d-none');
        return;
    }

    // 验证密码
    if (user.password !== password) {
        errorElement.textContent = '密码错误';
        errorElement.classList.remove('d-none');
        return;
    }

    // 登录成功，保存用户信息
    const userInfo = {
        id: user.id,
        username: user.username,
        role: user.role,
        roleName: user.roleName,
        permissions: user.permissions,
        token: 'mock-token-' + Date.now()
    };

    // 保存用户信息到localStorage
    localStorage.setItem('user', JSON.stringify(userInfo));

    // 关闭模态框
    const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
    modal.hide();

    // 更新UI
    checkLoginStatus();
} 