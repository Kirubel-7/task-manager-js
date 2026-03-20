const taskForm = document.querySelector(".task-form");
const titleInput = document.getElementById("task-title");
const descriptionInput = document.getElementById("task-description");
const addBtn = document.getElementById("add-btn");

const filterBtns = document.querySelectorAll(".filter-btn");
const filterButtonsListener = document.querySelector(".filter-buttons");
const taskList = document.getElementById("task-list");

const totalTaskCount = document.getElementById("total-tasks-count");
const completedTaskCount = document.getElementById("completed-tasks-count");

const tasks = [];
let taskId = 0;
let editingTaskId = null;

// ---------- helpers ----------

function updateTaskCounts() {
  totalTaskCount.textContent = tasks.length;
  completedTaskCount.textContent = tasks.filter(task => task.completed).length;
}

function getActiveFilter() {
  const activeBtn = document.querySelector(".filter-btn.is-active");
  return activeBtn ? activeBtn.dataset.filter : "all";
}

function applyFilter() {
  const filter = getActiveFilter();

  let filteredTasks = tasks;

  if (filter === "completed") {
    filteredTasks = tasks.filter(task => task.completed);
  } else if (filter === "pending") {
    filteredTasks = tasks.filter(task => !task.completed);
  }

  renderTasks(filteredTasks);
}

function resetFormState() {
  taskForm.reset();
  editingTaskId = null;
  addBtn.textContent = "Add Task";
}

function fillFormForEdit(task) {
  titleInput.value = task.title;
  descriptionInput.value = task.description;
  editingTaskId = task.id;
  addBtn.textContent = "Save Changes";
  titleInput.focus();
}

// ---------- data ----------

function addTask(title, description) {
  const task = {
    id: `task-${taskId++}`,
    title,
    description,
    completed: false,
  };

  tasks.push(task);
}

function updateTask(taskId, title, description) {
  const task = tasks.find(task => task.id === taskId);
  if (!task) return;

  task.title = title;
  task.description = description;
}

function deleteTask(taskId) {
  const index = tasks.findIndex(task => task.id === taskId);
  if (index === -1) return;

  tasks.splice(index, 1);

  if (editingTaskId === taskId) {
    resetFormState();
  }
}

function toggleTaskCompleted(taskId, completed) {
  const task = tasks.find(task => task.id === taskId);
  if (!task) return;

  task.completed = completed;
}

// ---------- render ----------

function renderTasks(taskArray) {
  taskList.innerHTML = "";

  taskArray.forEach(({ id, title, description, completed }) => {
    const taskItem = document.createElement("li");
    taskItem.className = "task-item";
    if (completed) {
      taskItem.classList.add("task-item--completed");
    }
    taskItem.dataset.taskId = id;
    taskItem.dataset.status = completed;

    taskItem.innerHTML = `
      <div class="task-item__main">
        <div class="task-item__status">
          <input
            class="task-item__checkbox"
            type="checkbox"
            id="${id}"
            ${completed ? "checked" : ""}
          >
          <label class="task-item__content" for="${id}">
            <span class="task-item__title"></span>
            <span class="task-item__description"></span>
          </label>
        </div>
        <div class="task-item__actions">
          <button
            type="button"
            class="task-action-button"
            data-action="edit"
            aria-label="Edit task: ${title}"
          >
            ✎
          </button>
          <button
            type="button"
            class="task-action-button task-action-button--danger"
            data-action="delete"
            aria-label="Delete task: ${title}"
          >
            🗑
          </button>
        </div>
      </div>
    `;

    taskItem.querySelector(".task-item__title").textContent = title;
    taskItem.querySelector(".task-item__description").textContent = description;

    taskList.appendChild(taskItem);
  });

  updateTaskCounts();
}

// ---------- form submit: add or edit ----------

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!title) return;

  if (editingTaskId) {
    updateTask(editingTaskId, title, description);
  } else {
    addTask(title, description);
  }

  applyFilter();
  resetFormState();
});

// ---------- filters ----------

filterButtonsListener.addEventListener("click", (event) => {
  const clickedBtn = event.target.closest(".filter-btn");
  if (!clickedBtn) return;

  filterBtns.forEach((btn) => {
    btn.classList.remove("is-active");
    btn.setAttribute("aria-pressed", "false");
  });

  clickedBtn.classList.add("is-active");
  clickedBtn.setAttribute("aria-pressed", "true");

  applyFilter();
});

// ---------- checkbox + edit/delete ----------

taskList.addEventListener("change", (event) => {
  if (!event.target.classList.contains("task-item__checkbox")) return;

  const taskItem = event.target.closest(".task-item");
  if (!taskItem) return;

  const taskId = taskItem.dataset.taskId;
  toggleTaskCompleted(taskId, event.target.checked);

  applyFilter();
});

taskList.addEventListener("click", (event) => {
  const actionBtn = event.target.closest(".task-action-button");
  if (!actionBtn) return;

  const taskItem = actionBtn.closest(".task-item");
  if (!taskItem) return;

  const taskId = taskItem.dataset.taskId;
  const action = actionBtn.dataset.action;

  if (action === "edit") {
    const task = tasks.find(task => task.id === taskId);
    if (!task) return;

    fillFormForEdit(task);
  }

  if (action === "delete") {
    deleteTask(taskId);
    applyFilter();
  }
});

// initial render
applyFilter();