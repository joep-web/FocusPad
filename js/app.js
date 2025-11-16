import { TaskStore } from './taskStore.js';

// DOM Elements
const addBtn = document.querySelector('.add-btn');
const cancelBtn = document.querySelector('.cancel-btn');
const saveBtn = document.querySelector('.save-btn');
const contForNotes = document.querySelector('.cont-for-notes');
const notesList = document.querySelector('.notes-list');
const searchInput = document.querySelector('.search-txt');
const gridBtn = document.querySelector('.grid-btn');
const listBtn = document.querySelector('.list-btn');

// State
let currentEditId = null;
let currentView = 'grid'; // 'grid' or 'list'

// Initialize
loadAndRenderTasks();
setActiveView('grid');

// Event: Open popup for new task
addBtn.addEventListener('click', () => {
  currentEditId = null;
  openPopup();
});

// Event: Save button
saveBtn.addEventListener('click', () => {
  const popup = document.querySelector('.opened-block');
  const titleInput = popup.querySelector('.block-title');
  const tagsInput = popup.querySelector('.tags');
  const projectInput = popup.querySelector('.project');
  const dueDateInput = popup.querySelector('.due-date');
  const descriptionInput = popup.querySelector('.description');

  const taskData = {
    title: titleInput.value,
    description: descriptionInput.value,
    tags: tagsInput.value.split(',').map(t => t.trim()).filter(Boolean),
    project: projectInput.value,
    dueDate: dueDateInput.value || null,
  };

  if (currentEditId) {
    TaskStore.update(currentEditId, taskData);
  } else {
    TaskStore.add(taskData);
  }

  closePopup();
  loadAndRenderTasks();
});

// Event: Cancel button
cancelBtn.addEventListener('click', () => {
  closePopup();
});

// Event: Grid/List toggle
gridBtn.addEventListener('click', () => {
  setActiveView('grid');
  loadAndRenderTasks();
});

listBtn.addEventListener('click', () => {
  setActiveView('list');
  loadAndRenderTasks();
});

// Event: Search
searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  if (!query) {
    loadAndRenderTasks();
    return;
  }

  const tasks = TaskStore.getAll();
  const filtered = tasks.filter(task => 
    task.title.toLowerCase().includes(query) ||
    task.description.toLowerCase().includes(query) ||
    (task.project && task.project.toLowerCase().includes(query))
  );

  renderTasks(filtered);
  renderSidebar(filtered);
});

// Set active view style
function setActiveView(view) {
  currentView = view;
  const listGridCont = document.querySelector('.list-grid-cont');
  
  if (view === 'grid') {
    contForNotes.classList.remove('list-style-cont');
    gridBtn.style.backgroundColor = '#3A3A3F';
    listBtn.style.backgroundColor = 'var(--darkM-bg-secondary)';
  } else {
    contForNotes.classList.add('list-style-cont');
    listBtn.style.backgroundColor = '#3A3A3F';
    gridBtn.style.backgroundColor = 'var(--darkM-bg-secondary)';
  }
}

// Load all tasks and render
function loadAndRenderTasks() {
  const tasks = TaskStore.getAll();
  renderTasks(tasks);
  renderSidebar(tasks);
}

// Render tasks in main area
function renderTasks(tasks) {
  contForNotes.innerHTML = '';

  tasks.forEach(task => {
    const block = createBlockElement(task);
    contForNotes.appendChild(block);
  });
}

// Render sidebar notes list
function renderSidebar(tasks) {
  notesList.innerHTML = '';

  tasks.forEach(task => {
    const noteItem = document.createElement('div');
    noteItem.className = 'note-item';
    noteItem.dataset.id = task.id;

    const img = document.createElement('img');
    img.src = 'src\\img\\notes-dark.svg';
    img.width = 30;
    img.height = 30;
    img.alt = 'note-icon';

    const p = document.createElement('p');
    p.textContent = task.title || 'Untitled';

    noteItem.appendChild(img);
    noteItem.appendChild(p);

    // Click to edit
    noteItem.addEventListener('click', () => {
      openTaskForEdit(task.id);
    });

    // Right click to delete
    noteItem.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (confirm(`Delete "${task.title}"?`)) {
        TaskStore.remove(task.id);
        loadAndRenderTasks();
      }
    });

    notesList.appendChild(noteItem);
  });
}

// Create a block element for a task
function createBlockElement(task) {
  const block = document.createElement('div');
  block.className = `block ${currentView === 'grid' ? 'grid-style-block' : 'list-style-block'}`;
  block.dataset.id = task.id;

  const title = document.createElement('h2');
  title.textContent = task.title || 'Untitled';

  const metaDiv = document.createElement('div');
  metaDiv.style.display = 'flex';
  metaDiv.style.gap = '8px';
  metaDiv.style.marginTop = '8px';
  metaDiv.style.flexWrap = 'wrap';

  if (task.project) {
    const projectDisplay = document.createElement('span');
    projectDisplay.className = 'project-display';
    projectDisplay.textContent = task.project;
    projectDisplay.style.padding = '4px 10px';
    projectDisplay.style.borderRadius = '13px';
    projectDisplay.style.border = '1px solid #6B9BD1';
    projectDisplay.style.color = '#6B9BD1';
    projectDisplay.style.backgroundColor = 'inherit';
    projectDisplay.style.fontSize = '12px';
    metaDiv.appendChild(projectDisplay);
  }

  if (task.dueDate) {
    const dueDisplay = document.createElement('span');
    dueDisplay.className = 'due-display';
    dueDisplay.textContent = `Due: ${new Date(task.dueDate).toLocaleDateString()}`;
    dueDisplay.style.padding = '4px 10px';
    dueDisplay.style.borderRadius = '13px';
    dueDisplay.style.border = '1px solid #D19B6B';
    dueDisplay.style.color = '#D19B6B';
    dueDisplay.style.backgroundColor = 'inherit';
    dueDisplay.style.fontSize = '12px';
    metaDiv.appendChild(dueDisplay);
  }

  const desc = document.createElement('p');
  desc.textContent = task.description || '';
  desc.style.marginTop = '10px';
  desc.style.overflow = 'hidden';
  desc.style.textOverflow = 'ellipsis';

  block.appendChild(title);
  if (task.project || task.dueDate) {
    block.appendChild(metaDiv);
  }
  block.appendChild(desc);

  // Click to edit
  block.addEventListener('click', () => {
    openTaskForEdit(task.id);
  });

  // Right click to delete
  block.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (confirm(`Delete "${task.title}"?`)) {
      TaskStore.remove(task.id);
      loadAndRenderTasks();
    }
  });

  return block;
}

// Open popup with or without task data
function openPopup(taskData = null) {
  const popup = document.createElement('div');
  popup.className = 'opened-block';
  popup.style.display = 'flex';

  popup.innerHTML = `
    <input type="text" placeholder="Title" name="title" class="block-title" value="${taskData ? taskData.title : ''}">
    <div class="cont-for-extras">
        <input type="text" placeholder="Tags" name="tags" class="tags" value="${taskData ? taskData.tags.join(', ') : ''}">
        <input type="text" placeholder="Project" name="project" class="project" value="${taskData ? taskData.project || '' : ''}">
        <input type="date" placeholder="Due Date" name="due-date" class="due-date" value="${taskData ? taskData.dueDate || '' : ''}">
    </div>
    <textarea name="description" placeholder="description" class="description">${taskData ? taskData.description : ''}</textarea>
    <div class="buttons">
        <button class="cancel-btn">Cancel</button>
        <button class="save-btn">Save</button>
    </div>
  `;

  document.body.appendChild(popup);

  // Reattach event listeners for this popup instance
  popup.querySelector('.cancel-btn').addEventListener('click', closePopup);
  popup.querySelector('.save-btn').addEventListener('click', () => {
    saveBtn.click();
  });
}

// Open task for editing
function openTaskForEdit(taskId) {
  const task = TaskStore.getById(taskId);
  if (!task) return;

  currentEditId = taskId;
  openPopup(task);
}

// Close and remove popup
function closePopup() {
  const popup = document.querySelector('.opened-block');
  if (popup) {
    popup.remove();
  }
  currentEditId = null;
}