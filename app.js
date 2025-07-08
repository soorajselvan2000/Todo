document.addEventListener('DOMContentLoaded', function() {
    // Single-panel elements
    const singlePanel = document.getElementById('single-panel');
    const addTaskSingleBtn = document.getElementById('add-task-single');
    const inputSingle = document.getElementById('task-input-single');

    // Two-panel elements
    const twoPanel = document.getElementById('two-panel');
    const addTaskBtn = document.getElementById('add-task');
    const input = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const pagination = document.getElementById('pagination');

    const tasks = [];
    const TASKS_PER_PAGE = 3;
    let currentPage = 1;

    const confirmModal = document.getElementById('customConfirmModal');
    const bsModal = new bootstrap.Modal(confirmModal);
    let pendingDeleteItem = null;

    function createTaskElement(taskText, index) {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex align-items-center justify-content-between';

        const span = document.createElement('span');
        span.textContent = taskText;
        span.className = 'flex-grow-1';

        // Strike Through Button
        const strikeBtn = document.createElement('button');
        strikeBtn.className = 'btn btn-outline-secondary btn-sm me-2';
        strikeBtn.textContent = '✔';

        // Edit Button
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-outline-primary btn-sm me-2';
        editBtn.textContent = 'Edit';

        // Delete Button (Trash Emoji)
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-outline-danger btn-sm';
        deleteBtn.textContent = '🗑️';

        // Strike Through Handler
        strikeBtn.addEventListener('click', function() {
            if (listItem.classList.contains('completed')) {
                // Remove strike-through
                listItem.classList.remove('completed');
                tasks[index].completed = false;
            } else {
                // Add strike-through
                listItem.classList.add('completed');
                tasks[index].completed = true;
            }
        });

        // Edit Handler
        editBtn.addEventListener('click', function() {
            if (listItem.classList.contains('completed')) return; // Don't edit completed
            const input = document.createElement('input');
            input.type = 'text';
            input.value = span.textContent;
            input.className = 'form-control form-control-sm';
            input.style.maxWidth = '70%';

            span.replaceWith(input);
            input.focus();

            function saveEdit() {
                const newText = input.value.trim();
                if (newText) {
                    span.textContent = newText;
                    input.replaceWith(span);
                    tasks[index].text = newText;

                    // Show tick mark after editing
                    let tick = document.createElement('span');
                    tick.textContent = ' ✔️';
                    tick.className = 'edit-tick';
                    tick.style.color = '#22c55e';
                    tick.style.fontSize = '1.1em';
                    tick.style.marginLeft = '6px';
                    span.appendChild(tick);

                    setTimeout(() => {
                        if (tick.parentNode) tick.remove();
                    }, 1200);
                } else {
                    listItem.classList.add('removing');
                    setTimeout(() => listItem.remove(), 400);
                }
            }

            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') saveEdit();
            });
            input.addEventListener('blur', saveEdit);
        });

        // Delete Handler
        deleteBtn.addEventListener('click', function() {
            pendingDeleteItem = listItem;
            bsModal.show();
        });

        listItem.appendChild(span);
        listItem.appendChild(strikeBtn);
        listItem.appendChild(editBtn);
        listItem.appendChild(deleteBtn);

        return listItem;
    }

    function renderTasks() {
        taskList.innerHTML = '';
        const start = (currentPage - 1) * TASKS_PER_PAGE;
        const end = start + TASKS_PER_PAGE;
        tasks.slice(start, end).forEach((task, idx) => {
            const listItem = createTaskElement(task.text, start + idx);
            // Restore completed state if needed
            if (task.completed) listItem.classList.add('completed');
            taskList.appendChild(listItem);
        });
        renderPagination();
    }

    function renderPagination() {
        pagination.innerHTML = '';
        const pageCount = Math.ceil(tasks.length / TASKS_PER_PAGE);
        if (pageCount <= 1) return;

        // Prev button
        const prev = document.createElement('li');
        prev.className = `page-item${currentPage === 1 ? ' disabled' : ''}`;
        prev.innerHTML = `<a class="page-link" href="#">«</a>`;
        prev.onclick = function(e) {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                renderTasks();
            }
        };
        pagination.appendChild(prev);

        // Page numbers
        for (let i = 1; i <= pageCount; i++) {
            const li = document.createElement('li');
            li.className = `page-item${i === currentPage ? ' active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            li.onclick = function(e) {
                e.preventDefault();
                currentPage = i;
                renderTasks();
            };
            pagination.appendChild(li);
        }

        // Next button
        const next = document.createElement('li');
        next.className = `page-item${currentPage === pageCount ? ' disabled' : ''}`;
        next.innerHTML = `<a class="page-link" href="#">»</a>`;
        next.onclick = function(e) {
            e.preventDefault();
            if (currentPage < pageCount) {
                currentPage++;
                renderTasks();
            }
        };
        pagination.appendChild(next);
    }

    function addTaskFromSinglePanel() {
        const taskText = inputSingle.value.trim();
        if (taskText) {
            const prevCount = tasks.length;
            tasks.push({ text: taskText, completed: false });
            inputSingle.value = '';
            saveTasks();
            updateLayout(prevCount);
            renderTasks();
        }
    }

    function addTaskFromTwoPanel() {
        const taskText = input.value.trim();
        if (taskText) {
            const prevCount = tasks.length;
            tasks.push({ text: taskText, completed: false });
            input.value = '';
            updateLayout(prevCount);
            renderTasks();
        }
    }

    function deleteTask(index) {
        const prevCount = tasks.length;
        tasks.splice(index, 1);
        saveTasks();
        updateLayout(prevCount);
        renderTasks();
    }

    function updateLayout(prevTaskCount) {
        if (tasks.length === 0) {
            singlePanel.classList.remove('d-none');
            twoPanel.classList.add('d-none');
            twoPanel.classList.remove('beautiful-panel-appear');
        } else {
            singlePanel.classList.add('d-none');
            twoPanel.classList.remove('d-none');
            // Only animate if coming from 0 tasks
            if (prevTaskCount === 0) {
                twoPanel.classList.add('beautiful-panel-appear');
                setTimeout(() => twoPanel.classList.remove('beautiful-panel-appear'), 1800);
            }
        }
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    addTaskSingleBtn.addEventListener('click', addTaskFromSinglePanel);
    inputSingle.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') addTaskFromSinglePanel();
    });

    addTaskBtn.addEventListener('click', addTaskFromTwoPanel);
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') addTaskFromTwoPanel();
    });

    document.querySelector('.beautiful-confirm').addEventListener('click', function() {
        if (pendingDeleteItem) {
            pendingDeleteItem.classList.add('removing');
            setTimeout(() => pendingDeleteItem.remove(), 400);
            pendingDeleteItem = null;
        }
        bsModal.hide();
    });

    // Initial render
    renderTasks();
    updateLayout();
});