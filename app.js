document.addEventListener('DOMContentLoaded', function () {
  const inputSingle = document.getElementById('task-input-single');
  const dateInputSingle = document.getElementById('date-input-single');
  const addTaskBtn = document.getElementById('add-task-single');
  const taskList = document.getElementById('task-list');
  const pagination = document.getElementById('pagination');
  const searchInput = document.getElementById('search-task');
  const filterSelect = document.getElementById('filter-tasks');

  const TASKS_PER_PAGE = 5;
  let currentPage = 1;

  let tasksByDate = JSON.parse(localStorage.getItem('tasksByDate')) || {};
  let pendingDeleteItem = null;
  const confirmModal = new bootstrap.Modal(document.getElementById('customConfirmModal'));

  function saveTasks() {
    localStorage.setItem('tasksByDate', JSON.stringify(tasksByDate));
  }

  function createTaskElement(taskText, index, date) {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';

    const span = document.createElement('span');
    span.innerHTML = `<strong>${taskText}</strong><br><small class="text-muted">${date}</small>`;
    span.className = 'flex-grow-1';

    const completeBtn = document.createElement('button');
    completeBtn.className = 'btn btn-sm btn-outline-success me-2';
    completeBtn.textContent = '✔';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-sm btn-outline-primary me-2';
    editBtn.textContent = 'Edit';

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-sm btn-outline-danger';
    deleteBtn.textContent = '🗑️';

    completeBtn.addEventListener('click', function () {
      li.classList.toggle('completed');
      tasksByDate[date][index].completed = li.classList.contains('completed');
      saveTasks();
    });

    editBtn.addEventListener('click', function () {
      const input = document.createElement('input');
      input.type = 'text';
      input.value = taskText;
      input.className = 'form-control form-control-sm';

      span.replaceWith(input);
      input.focus();

      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          const newText = input.value.trim();
          if (newText) {
            tasksByDate[date][index].text = newText;
            saveTasks();
            renderTasks(date);
          }
        }
      });

      input.addEventListener('blur', function () {
        renderTasks(date);
      });
    });

    deleteBtn.addEventListener('click', function () {
      pendingDeleteItem = { index, date };
      confirmModal.show();
    });

    li.appendChild(span);
    li.appendChild(completeBtn);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

    if (tasksByDate[date][index].completed) {
      li.classList.add('completed');
    }

    return li;
  }

  function renderTasks(date) {
    taskList.innerHTML = '';
    if (!tasksByDate[date]) return;

    const searchValue = searchInput.value.trim().toLowerCase();

    const statusFilter = filterSelect.value;
    const filtered = tasksByDate[date].filter(task => {
    const matchesSearch = task.text.toLowerCase().includes(searchValue);
    const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'completed' && task.completed) ||
        (statusFilter === 'pending' && !task.completed);
    return matchesSearch && matchesStatus;
    });

    const start = (currentPage - 1) * TASKS_PER_PAGE;
    const paginated = filtered.slice(start, start + TASKS_PER_PAGE);

    paginated.forEach((task, index) => {
      const li = createTaskElement(task.text, tasksByDate[date].indexOf(task), date);
      taskList.appendChild(li);
    });

    renderPagination(filtered.length);
  }

  function renderPagination(count) {
    pagination.innerHTML = '';
    const pages = Math.ceil(count / TASKS_PER_PAGE);
    if (pages <= 1) return;

    for (let i = 1; i <= pages; i++) {
      const li = document.createElement('li');
      li.className = `page-item ${i === currentPage ? 'active' : ''}`;
      li.innerHTML = `<a href="#" class="page-link">${i}</a>`;
      li.addEventListener('click', function (e) {
        e.preventDefault();
        currentPage = i;
        renderTasks(dateInputSingle.value);
      });
      pagination.appendChild(li);
    }
  }

    function downloadFile(content, fileName, type) {
    const blob = new Blob([content], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
    }

    function exportTasks(format) {
        const date = dateInputSingle.value;
        if (!tasksByDate[date]) return;

            const tasks = tasksByDate[date];
            let content = '';
            let fileName = `tasks_${date}`;
            let mimeType = 'text/plain';

        switch (format) {
            case 'json':
            content = JSON.stringify(tasks, null, 2);
            fileName += '.json';
            mimeType = 'application/json';
            break;
            case 'txt':
            content = tasks.map(t => `- ${t.text} [${t.completed ? '✔' : '❌'}]`).join('\n');
            fileName += '.txt';
            break;
            case 'csv':
            content = "Task,Completed\n" + tasks.map(t => `"${t.text}",${t.completed}`).join('\n');
            fileName += '.csv';
            mimeType = 'text/csv';
            break;
            case 'sql':
            content = tasks.map((t, i) =>
                `INSERT INTO todos (id, task, completed, date) VALUES (${i + 1}, '${t.text.replace(/'/g, "''")}', ${t.completed ? 1 : 0}, '${date}');`
            ).join('\n');
            fileName += '.sql';
            mimeType = 'text/sql';
            break;
            case 'pdf':
            const win = window.open('', '_blank');
            win.document.write(`<pre>${tasks.map(t => `• ${t.text} [${t.completed ? '✔' : '❌'}]`).join('\n')}</pre>`);
            win.document.close();
            win.print();
            return;
        }

        downloadFile(content, fileName, mimeType);
    }


  function addTask() {
    const text = inputSingle.value.trim();
    const date = dateInputSingle.value;

    if (text && date) {
      if (!tasksByDate[date]) tasksByDate[date] = [];
      tasksByDate[date].push({ text, completed: false });
      saveTasks();
      inputSingle.value = '';
      renderTasks(date);
    }
  }

  addTaskBtn.addEventListener('click', addTask);
  inputSingle.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') addTask();
  });

  dateInputSingle.addEventListener('change', function () {
    currentPage = 1;
    renderTasks(dateInputSingle.value);
  });

  searchInput.addEventListener('input', function () {
    currentPage = 1;
    renderTasks(dateInputSingle.value);
  });

  filterSelect.addEventListener('change', function () {
    currentPage = 1;
    renderTasks(dateInputSingle.value);
  });

    document.querySelectorAll('.export-option').forEach(item => {
    item.addEventListener('click', function (e) {
        e.preventDefault();
        exportTasks(this.getAttribute('data-type'));
    });
    });



  document.querySelector('.beautiful-confirm').addEventListener('click', function () {
    const { index, date } = pendingDeleteItem;
    tasksByDate[date].splice(index, 1);
    if (tasksByDate[date].length === 0) delete tasksByDate[date];
    saveTasks();
    renderTasks(date);
    confirmModal.hide();
  });

  renderTasks(dateInputSingle.value);
});
