// ✅ Cleaned & Working app.js for Date-based Task Storage with Single Input Panel

document.addEventListener('DOMContentLoaded', function () {
    const addTaskBtn = document.getElementById('add-task-single');
    const taskInput = document.getElementById('task-input-single');
    const dateInput = document.getElementById('date-input-single');
    const taskList = document.getElementById('task-list');
    const pagination = document.getElementById('pagination');

    const TASKS_PER_PAGE = 3;
    let currentPage = 1;
    let tasksByDate = JSON.parse(localStorage.getItem('tasksByDate')) || {};

    const confirmModal = document.getElementById('customConfirmModal');
    const bsModal = new bootstrap.Modal(confirmModal);
    let pendingDeleteItem = null;

    function saveTasks() {
        localStorage.setItem('tasksByDate', JSON.stringify(tasksByDate));
    }

    function createTaskElement(taskText, index, date) {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex align-items-center justify-content-between';

        const span = document.createElement('span');
        span.innerHTML = `<strong>${taskText}</strong><br><small class="text-muted">${date}</small>`;
        span.className = 'flex-grow-1';

        const strikeBtn = document.createElement('button');
        strikeBtn.className = 'btn btn-outline-secondary btn-sm me-2';
        strikeBtn.textContent = '✔';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-outline-primary btn-sm me-2';
        editBtn.textContent = 'Edit';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-outline-danger btn-sm';
        deleteBtn.textContent = '🗑️';

        strikeBtn.addEventListener('click', function () {
            listItem.classList.toggle('completed');
            tasksByDate[date][index].completed = listItem.classList.contains('completed');
            saveTasks();
        });

        editBtn.addEventListener('click', function () {
            if (listItem.classList.contains('completed')) return;

            const input = document.createElement('input');
            input.type = 'text';
            input.value = taskText;
            input.className = 'form-control form-control-sm';
            input.style.maxWidth = '70%';

            span.replaceWith(input);
            input.focus();

            function saveEdit() {
                const newText = input.value.trim();
                if (newText) {
                    tasksByDate[date][index].text = newText;
                    saveTasks();
                    renderTasks(date);
                }
            }

            input.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') saveEdit();
            });
            input.addEventListener('blur', saveEdit);
        });

        deleteBtn.addEventListener('click', function () {
            pendingDeleteItem = { index, date };
            bsModal.show();
        });

        listItem.appendChild(span);
        listItem.appendChild(strikeBtn);
        listItem.appendChild(editBtn);
        listItem.appendChild(deleteBtn);

        return listItem;
    }

    function renderTasks(date) {
        taskList.innerHTML = '';
        if (!date || !tasksByDate[date]) return;

        const taskArray = tasksByDate[date];
        const start = (currentPage - 1) * TASKS_PER_PAGE;
        const end = start + TASKS_PER_PAGE;

        taskArray.slice(start, end).forEach((task, idx) => {
            const listItem = createTaskElement(task.text, idx, date);
            if (task.completed) listItem.classList.add('completed');
            taskList.appendChild(listItem);
        });

        renderPagination(taskArray.length);
    }

    function renderPagination(totalCount) {
        pagination.innerHTML = '';
        const pageCount = Math.ceil(totalCount / TASKS_PER_PAGE);
        if (pageCount <= 1) return;

        const prev = document.createElement('li');
        prev.className = `page-item${currentPage === 1 ? ' disabled' : ''}`;
        prev.innerHTML = `<a class="page-link" href="#">«</a>`;
        prev.onclick = function (e) {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                renderTasks(dateInput.value);
            }
        };
        pagination.appendChild(prev);

        for (let i = 1; i <= pageCount; i++) {
            const li = document.createElement('li');
            li.className = `page-item${i === currentPage ? ' active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            li.onclick = function (e) {
                e.preventDefault();
                currentPage = i;
                renderTasks(dateInput.value);
            };
            pagination.appendChild(li);
        }

        const next = document.createElement('li');
        next.className = `page-item${currentPage === pageCount ? ' disabled' : ''}`;
        next.innerHTML = `<a class="page-link" href="#">»</a>`;
        next.onclick = function (e) {
            e.preventDefault();
            if (currentPage < pageCount) {
                currentPage++;
                renderTasks(dateInput.value);
            }
        };
        pagination.appendChild(next);
    }

    function addTask() {
        const taskText = taskInput.value.trim();
        const taskDate = dateInput.value;

        if (taskText && taskDate) {
            if (!tasksByDate[taskDate]) tasksByDate[taskDate] = [];
            tasksByDate[taskDate].push({ text: taskText, completed: false });
            taskInput.value = '';
            saveTasks();
            renderTasks(taskDate);
        }
    }

    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') addTask();
    });
    dateInput.addEventListener('change', function () {
        currentPage = 1;
        renderTasks(dateInput.value);
    });

    document.querySelector('.beautiful-confirm').addEventListener('click', function () {
        if (pendingDeleteItem) {
            const { index, date } = pendingDeleteItem;
            tasksByDate[date].splice(index, 1);
            if (tasksByDate[date].length === 0) delete tasksByDate[date];
            saveTasks();
            renderTasks(date);
            pendingDeleteItem = null;
        }
        bsModal.hide();
    });

    if (dateInput.value) renderTasks(dateInput.value);
});
