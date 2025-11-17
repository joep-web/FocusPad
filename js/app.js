import { TaskStore } from './taskStore.js';

// DOM Elements
const addBtn = document.querySelector('.add-btn');
const contForNotes = document.querySelector('.cont-for-notes');
const notesList = document.querySelector('.notes-list');
const searchInput = document.querySelector('.search-txt');
const gridBtn = document.querySelector('.grid-btn');
const listBtn = document.querySelector('.list-btn');
const settings = document.querySelector(".settings-cont")

// State
let currentEditId = null;
let currentView = 'grid'; // 'grid' or 'list'
let deleteConfirmPopup = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadAndRenderTasks();
  setView('grid');
});

// Event: Open popup for new task
addBtn.addEventListener('click', () => {
  currentEditId = null;
  openPopup();
});

// Event: Grid/List view toggle
gridBtn.addEventListener('click', () => setView('grid'));
listBtn.addEventListener('click', () => setView('list'));

// Event: Search
searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  filterTasks(query);
});

// Open popup for creating/editing
function openPopup(task = null) {
  // Remove existing popup if any
  const existingPopup = document.querySelector('.opened-block');
  if (existingPopup) existingPopup.remove();

  // Create new popup
  const popup = document.createElement('div');
  popup.className = 'opened-block';
  popup.style.opacity = '0';
  popup.style.transform = 'translate(-50%, -50%) scale(0.9)';
  
  popup.innerHTML = `
    <input type="text" placeholder="Title" class="block-title" value="${task?.title || ''}">
    <div class="cont-for-extras">
      <input type="text" placeholder="Tags" class="tags" value="${task?.tags?.join(', ') || ''}">
      <input type="text" placeholder="Project" class="project" value="${task?.project || ''}">
      <input type="date" placeholder="Due Date" class="due-date" value="${task?.dueDate || ''}">
    </div>
    <textarea placeholder="Description" class="description">${task?.description || ''}</textarea>
    <div class="buttons">
      <button class="cancel-btn">Cancel</button>
      <button class="save-btn">Save</button>
    </div>
  `;

  document.body.appendChild(popup);

  // Animate in
  setTimeout(() => {
    popup.style.opacity = '1';
    popup.style.transform = 'translate(-50%, -50%) scale(1)';
  }, 10);

  // Event listeners
  popup.querySelector('.cancel-btn').addEventListener('click', () => closePopup(popup));
  popup.querySelector('.save-btn').addEventListener('click', () => saveTask(popup));
}

// Close popup
function closePopup(popup) {
  popup.style.opacity = '0';
  popup.style.transform = 'translate(-50%, -50%) scale(0.9)';
  setTimeout(() => popup.remove(), 300);
  currentEditId = null;
}

// Save task
function saveTask(popup) {
  const titleInput = popup.querySelector('.block-title');
  const tagsInput = popup.querySelector('.tags');
  const projectInput = popup.querySelector('.project');
  const dueDateInput = popup.querySelector('.due-date');
  const descriptionInput = popup.querySelector('.description');

  const taskData = {
    title: titleInput.value || 'Untitled',
    description: descriptionInput.value,
    tags: tagsInput.value.split(/[,;\s]+/).map(t => t.trim()).filter(Boolean),
    project: projectInput.value,
    dueDate: dueDateInput.value || null,
  };

  if (currentEditId) {
    TaskStore.update(currentEditId, taskData);
  } else {
    TaskStore.add(taskData);
  }

  closePopup(popup);
  loadAndRenderTasks();
}

// Set view (grid or list)
function setView(view) {
  currentView = view;
  
  if (view === 'grid') {
    contForNotes.classList.remove('list-style-cont');
    gridBtn.style.backgroundColor = '#3A3A3F';
    listBtn.style.backgroundColor = '#28282B';
  } else {
    contForNotes.classList.add('list-style-cont');
    listBtn.style.backgroundColor = '#3A3A3F';
    gridBtn.style.backgroundColor = '#28282B';
  }
  
  loadAndRenderTasks();
}

// Load all tasks and render
function loadAndRenderTasks() {
  const tasks = TaskStore.getAll();
  contForNotes.innerHTML = '';
  notesList.innerHTML = '';

  tasks.forEach((task, index) => {
    // Add to main content
    const block = createBlockElement(task);
    block.style.opacity = '0';
    block.style.transform = currentView === 'grid' ? 'scale(0.8)' : 'translateX(-20px)';
    contForNotes.appendChild(block);
    
    // Animate in with delay
    setTimeout(() => {
      block.style.opacity = '1';
      block.style.transform = currentView === 'grid' ? 'scale(1)' : 'translateX(0)';
    }, index * 50);

    // Add to sidebar
    const noteItem = createNoteItem(task);
    notesList.appendChild(noteItem);
  });
}

// Create block element
function createBlockElement(task) {
  const block = document.createElement('div');
  block.className = `block ${currentView === 'grid' ? 'grid-style-block' : 'list-style-block'}`;
  block.dataset.id = task.id;

  const title = document.createElement('h2');
  title.style.overflow = 'hidden';
  title.style.textOverflow = 'ellipsis';
  title.style.whiteSpace = 'nowrap';
  title.textContent = task.title || 'Untitled';

  const metaDiv = document.createElement('div');
  metaDiv.style.display = 'flex';
  metaDiv.style.gap = '10px';
  metaDiv.style.margin = '8px 0';
  metaDiv.style.flexWrap = 'wrap';

  if (task.project) {
    const projectTag = document.createElement('p');
    projectTag.className = 'project-display';
    projectTag.textContent = task.project;
    projectTag.style.cssText = `
      padding: 4px 12px;
      border-radius: 13px;
      border: 1px solid #6B9BD1;
      color: #6B9BD1;
      background-color: inherit;
      font-size: 12px;
      white-space: nowrap;
    `;
    metaDiv.appendChild(projectTag);
  }

  if (task.dueDate) {
    const dueTag = document.createElement('p');
    dueTag.className = 'due-display';
    const date = new Date(task.dueDate);
    dueTag.textContent = `Due ${date.toLocaleDateString()}`;
    dueTag.style.cssText = `
      padding: 4px 12px;
      border-radius: 13px;
      border: 1px solid #D16B6B;
      color: #D16B6B;
      background-color: inherit;
      font-size: 12px;
      white-space: nowrap;
    `;
    metaDiv.appendChild(dueTag);
  }

  const desc = document.createElement('p');
  desc.textContent = task.description || '';
  desc.style.overflow = 'hidden';
  desc.style.textOverflow = 'ellipsis';

  if (currentView === 'list') {
    block.style.display = 'flex';
    block.style.alignItems = 'center';
    block.style.gap = '15px';
    title.style.flex = '0 0 200px';
    metaDiv.style.flex = '0 0 auto';
    metaDiv.style.margin = '0';
    desc.style.flex = '1';
    desc.style.whiteSpace = 'nowrap';
  }

  block.appendChild(title);
  block.appendChild(metaDiv);
  block.appendChild(desc);

  // Click to edit
  block.addEventListener('click', () => {
    openTaskForEdit(task.id);
  });

  // Right-click to delete
  block.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showDeleteConfirm(task.id, task.title);
  });

  return block;
}

// Create sidebar note item
function createNoteItem(task) {
  const noteItem = document.createElement('div');
  noteItem.className = 'note-item';
  noteItem.dataset.id = task.id;
  
  noteItem.innerHTML = `
    <img src="src/img/notes-dark.svg" width="30px" height="30px" alt="note-icon">
    <p>${task.title || 'Untitled'}</p>
  `;

  // Click to edit
  noteItem.addEventListener('click', () => {
    openTaskForEdit(task.id);
  });

  // Right-click to delete
  noteItem.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showDeleteConfirm(task.id, task.title);
  });

  return noteItem;
}

// Open task for editing
function openTaskForEdit(taskId) {
  const task = TaskStore.getById(taskId);
  if (!task) return;
  currentEditId = taskId;
  openPopup(task);
}

// Show delete confirmation popup
function showDeleteConfirm(taskId, taskTitle) {
  // Remove existing confirm popup
  if (deleteConfirmPopup) deleteConfirmPopup.remove();

  deleteConfirmPopup = document.createElement('div');
  deleteConfirmPopup.className = 'delete-confirm-popup';
  deleteConfirmPopup.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.9);
    background-color: #28282B;
    border: 1px solid #F4F4F6;
    border-radius: 13px;
    padding: 30px;
    min-width: 400px;
    z-index: 1000;
    opacity: 0;
    transition: all 0.3s ease;
  `;

  deleteConfirmPopup.innerHTML = `
    <h3 style="margin-bottom: 15px; color: white;">Delete Task?</h3>
    <p style="margin-bottom: 25px; color: #F4F4F6;">Are you sure you want to delete "${taskTitle}"?</p>
    <div style="display: flex; gap: 15px; justify-content: flex-end;">
      <button class="cancel-delete-btn" style="
        padding: 10px 25px;
        border: 1px solid #F4F4F6;
        background-color: inherit;
        color: #F4F4F6;
        border-radius: 10px;
        cursor: pointer;
      ">Cancel</button>
      <button class="confirm-delete-btn" style="
        padding: 10px 25px;
        border: none;
        background-color: #D16B6B;
        color: white;
        border-radius: 10px;
        cursor: pointer;
      ">Delete</button>
    </div>
  `;

  document.body.appendChild(deleteConfirmPopup);

  // Animate in
  setTimeout(() => {
    deleteConfirmPopup.style.opacity = '1';
    deleteConfirmPopup.style.transform = 'translate(-50%, -50%) scale(1)';
  }, 10);

  // Event listeners
  deleteConfirmPopup.querySelector('.cancel-delete-btn').addEventListener('click', () => {
    closeDeleteConfirm();
  });

  deleteConfirmPopup.querySelector('.confirm-delete-btn').addEventListener('click', () => {
    TaskStore.remove(taskId);
    closeDeleteConfirm();
    loadAndRenderTasks();
  });
}

// Close delete confirmation
function closeDeleteConfirm() {
  if (deleteConfirmPopup) {
    deleteConfirmPopup.style.opacity = '0';
    deleteConfirmPopup.style.transform = 'translate(-50%, -50%) scale(0.9)';
    setTimeout(() => {
      deleteConfirmPopup.remove();
      deleteConfirmPopup = null;
    }, 300);
  }
}

// Filter tasks by search query
function filterTasks(query) {
  const tasks = TaskStore.getAll();
  contForNotes.innerHTML = '';
  notesList.innerHTML = '';

  const filtered = tasks.filter(task => {
    const titleMatch = task.title.toLowerCase().includes(query);
    const descMatch = task.description.toLowerCase().includes(query);
    const projectMatch = task.project?.toLowerCase().includes(query);
    const tagsMatch = task.tags.some(tag => tag.toLowerCase().includes(query));
    return titleMatch || descMatch || projectMatch || tagsMatch;
  });

  filtered.forEach((task, index) => {
    const block = createBlockElement(task);
    block.style.opacity = '0';
    block.style.transform = 'translateY(10px)';
    contForNotes.appendChild(block);
    
    setTimeout(() => {
      block.style.opacity = '1';
      block.style.transform = 'translateY(0)';
    }, index * 30);

    const noteItem = createNoteItem(task);
    notesList.appendChild(noteItem);
  });
}


// Add this to your app.js file

// Settings Menu functionality
const settingsCont = document.querySelector('.settings-cont');
let settingsMenu = null;
let logoutConfirm = null;

// Event: Open settings menu
settingsCont.addEventListener('click', (e) => {
  e.stopPropagation();
  if (settingsMenu) {
    closeSettingsMenu();
  } else {
    openSettingsMenu();
  }
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (settingsMenu && !settingsMenu.contains(e.target) && !settingsCont.contains(e.target)) {
    closeSettingsMenu();
  }
});

function openSettingsMenu() {
  settingsMenu = document.createElement('div');
  settingsMenu.className = 'settings-menu';
  settingsMenu.style.cssText = `
    position: absolute;
    bottom: 100%;
    left: 0;
    margin-bottom: 10px;
    background-color: #28282B;
    border: 1px solid #F4F4F6;
    border-radius: 10px;
    min-width: 190px;
    padding: 10px;
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s ease;
    z-index: 1000;
  `;

  settingsMenu.innerHTML = `
    <a href="about.html" class="settings-menu-item" style="
      display: block;
      padding: 12px 15px;
      color: #F4F4F6;
      text-decoration: none;
      border-radius: 7px;
      transition: background-color 0.2s ease;
      margin-bottom: 5px;
    ">About Us</a>
    <div class="settings-menu-item logout-item" style="
      padding: 12px 15px;
      color: #F4F4F6;
      border-radius: 7px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    ">Log Out</div>
  `;

  settingsCont.appendChild(settingsMenu);

  // Animate in
  setTimeout(() => {
    settingsMenu.style.opacity = '1';
    settingsMenu.style.transform = 'translateY(0)';
  }, 10);

  // Add hover effects
  const menuItems = settingsMenu.querySelectorAll('.settings-menu-item');
  menuItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      item.style.backgroundColor = '#3A3A3F';
    });
    item.addEventListener('mouseleave', () => {
      item.style.backgroundColor = 'transparent';
    });
  });

  // Log out click
  settingsMenu.querySelector('.logout-item').addEventListener('click', () => {
    showLogoutConfirm();
  });
}

function closeSettingsMenu() {
  if (settingsMenu) {
    settingsMenu.style.opacity = '0';
    settingsMenu.style.transform = 'translateY(10px)';
    setTimeout(() => {
      settingsMenu.remove();
      settingsMenu = null;
    }, 300);
  }
}

function showLogoutConfirm() {
  closeSettingsMenu();
  
  logoutConfirm = document.createElement('div');
  logoutConfirm.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.9);
    background-color: #28282B;
    border: 1px solid #F4F4F6;
    border-radius: 13px;
    padding: 30px;
    min-width: 400px;
    z-index: 1001;
    opacity: 0;
    transition: all 0.3s ease;
  `;

  logoutConfirm.innerHTML = `
    <h3 style="margin-bottom: 15px; color: white; font-size: 1.5rem;">Log Out?</h3>
    <p style="margin-bottom: 25px; color: #F4F4F6;">Are you sure you want to log out?</p>
    <div style="display: flex; gap: 15px; justify-content: flex-end;">
      <button class="cancel-logout-btn" style="
        padding: 10px 25px;
        border: 1px solid #F4F4F6;
        background-color: inherit;
        color: #F4F4F6;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s ease;
      ">Cancel</button>
      <button class="confirm-logout-btn" style="
        padding: 10px 25px;
        border: none;
        background-color: #D16B6B;
        color: white;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.2s ease;
      ">Log Out</button>
    </div>
  `;

  document.body.appendChild(logoutConfirm);

  // Animate in
  setTimeout(() => {
    logoutConfirm.style.opacity = '1';
    logoutConfirm.style.transform = 'translate(-50%, -50%) scale(1)';
  }, 10);

  // Event listeners
  logoutConfirm.querySelector('.cancel-logout-btn').addEventListener('click', () => {
    closeLogoutConfirm();
  });

  logoutConfirm.querySelector('.confirm-logout-btn').addEventListener('click', () => {
    // Add your logout logic here (redirect to login page, clear session, etc.)
    window.location.href = '../index.html'; // Change to your login page
  });

  // Hover effects
  const buttons = logoutConfirm.querySelectorAll('button');
  buttons.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'scale(1.05)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'scale(1)';
    });
  });
}

function closeLogoutConfirm() {
  if (logoutConfirm) {
    logoutConfirm.style.opacity = '0';
    logoutConfirm.style.transform = 'translate(-50%, -50%) scale(0.9)';
    setTimeout(() => {
      logoutConfirm.remove();
      logoutConfirm = null;
    }, 300);
  }
}