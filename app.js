// 获取DOM元素
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const tasksCounter = document.getElementById('tasks-counter');
const clearCompletedBtn = document.getElementById('clear-completed');
const filterBtns = document.querySelectorAll('.filter-btn');

// 任务数组
let tasks = [];
let currentFilter = 'all';

// 从本地存储加载任务
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        renderTasks();
    }
}

// 保存任务到本地存储
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// 渲染任务列表
function renderTasks() {
    // 清空任务列表
    taskList.innerHTML = '';
    
    // 根据当前过滤器筛选任务
    let filteredTasks = tasks;
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }
    
    // 如果没有任务，显示提示信息
    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'task-item empty-message';
        emptyMessage.textContent = currentFilter === 'all' ? '没有任务，添加一个吧！' : 
                                  currentFilter === 'active' ? '没有未完成的任务！' : '没有已完成的任务！';
        taskList.appendChild(emptyMessage);
    } else {
        // 渲染任务列表
        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskItem.dataset.id = task.id;
            
            taskItem.innerHTML = `
                <label class="task-checkbox">
                    <input type="checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="checkmark"></span>
                </label>
                <span class="task-text">${task.text}</span>
                <div class="task-actions">
                    <button class="edit-btn"><i class="fas fa-pencil-alt"></i></button>
                    <button class="delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            taskList.appendChild(taskItem);
        });
    }
    
    // 更新任务计数
    updateTaskCounter();
}

// 更新任务计数
function updateTaskCounter() {
    const activeCount = tasks.filter(task => !task.completed).length;
    tasksCounter.textContent = `${activeCount} 个未完成，共 ${tasks.length} 个任务`;
}

// 添加新任务
function addTask(text) {
    if (text.trim() === '') return;
    
    const newTask = {
        id: Date.now().toString(),
        text: text.trim(),
        completed: false
    };
    
    tasks.unshift(newTask); // 添加到数组开头，使新任务显示在顶部
    saveTasks();
    renderTasks();
    
    // 清空输入框
    taskInput.value = '';
    taskInput.focus();
}

// 切换任务完成状态
function toggleTaskStatus(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    
    saveTasks();
    renderTasks();
}

// 删除任务
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

// 编辑任务
function editTask(id, newText) {
    if (newText.trim() === '') return;
    
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, text: newText.trim() };
        }
        return task;
    });
    
    saveTasks();
    renderTasks();
}

// 清除已完成的任务
function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
}

// 设置过滤器
function setFilter(filter) {
    currentFilter = filter;
    
    // 更新过滤按钮状态
    filterBtns.forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    renderTasks();
}

// 事件监听器

// 表单提交事件（添加任务）
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addTask(taskInput.value);
});

// 任务列表点击事件（完成、删除、编辑任务）
taskList.addEventListener('click', (e) => {
    const taskItem = e.target.closest('.task-item');
    if (!taskItem) return;
    
    const taskId = taskItem.dataset.id;
    
    // 复选框点击 - 切换任务状态
    if (e.target.type === 'checkbox') {
        toggleTaskStatus(taskId);
    }
    
    // 删除按钮点击
    if (e.target.classList.contains('fa-trash') || e.target.classList.contains('delete-btn')) {
        deleteTask(taskId);
    }
    
    // 编辑按钮点击
    if (e.target.classList.contains('fa-pencil-alt') || e.target.classList.contains('edit-btn')) {
        const taskTextElement = taskItem.querySelector('.task-text');
        const currentText = taskTextElement.textContent;
        
        const newText = prompt('编辑任务:', currentText);
        if (newText !== null) {
            editTask(taskId, newText);
        }
    }
});

// 清除已完成按钮点击事件
clearCompletedBtn.addEventListener('click', clearCompleted);

// 过滤按钮点击事件
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        setFilter(btn.dataset.filter);
    });
});

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    setFilter('all');
});