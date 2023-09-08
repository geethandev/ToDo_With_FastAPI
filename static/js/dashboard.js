document.addEventListener("DOMContentLoaded", function () {
    const createTaskForm = document.getElementById("create-task-form");
    const taskTitleInput = document.getElementById("task-title");
    const taskList = document.getElementById("task-list");
    const logoutButton = document.getElementById("logout-button");
    const editTaskModal = document.getElementById("edit-task-modal");
    const closeEditModalButton = document.getElementById("close-edit-modal");
    const editedTaskTitleInput = document.getElementById("edited-task-title");
    const editTaskForm = document.getElementById("edit-task-form");
  
    let currentEditingTaskId = null; // Track the ID of the currently edited task
  
    function createTaskItemElement(task) {
      const taskItem = document.createElement("li");
      taskItem.dataset.taskId = task.id;
  
      const taskTitleElement = document.createElement("span");
      taskTitleElement.textContent = task.title;
  
      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.dataset.taskId = task.id; // Attach task ID to the button
      editButton.addEventListener("click", () => openEditModal(task.id));
  
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", () => deleteTask(task.id));
  
      taskItem.appendChild(taskTitleElement);
      taskItem.appendChild(editButton);
      taskItem.appendChild(deleteButton);
  
      return taskItem;
    }
  
    // Function to add a new task to the list
    function addTaskToList(task) {
      const taskItem = createTaskItemElement(task);
      taskList.appendChild(taskItem);
    }
  
    // Function to update a task in the list
    function updateTaskInList(taskId, newTitle) {
      const taskItem = document.querySelector(`li[data-task-id="${taskId}"]`);
      if (taskItem) {
        taskItem.querySelector("span").textContent = newTitle;
      }
    }
  
    // Function to remove a task from the list
    function removeTaskFromList(taskId) {
      const taskItem = document.querySelector(`li[data-task-id="${taskId}"]`);
      if (taskItem) {
        taskItem.remove();
      }
    }
  
    // Handle edit button clicks
    function openEditModal(taskId) {
      currentEditingTaskId = taskId; // Set the current editing task ID
      editedTaskTitleInput.value = ""; // Clear the input field
      editTaskModal.style.display = "block";
    }
  
    // Handle form submission to update the task
    editTaskForm.addEventListener("submit", function (event) {
      event.preventDefault();
  
      const editedTaskTitle = editedTaskTitleInput.value;
  
      fetch(`/task/${currentEditingTaskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ title: editedTaskTitle }),
      })
        .then((response) => {
          if (response.status === 200) {
            // Close the edit modal
            editTaskModal.style.display = "none";
  
            // Update the content of the task item on the page
            updateTaskInList(currentEditingTaskId, editedTaskTitle);
          } else {
            throw new Error("Failed to update task.");
          }
        })
        .catch((error) => {
          console.error("Error updating task:", error);
        });
    });
  
    // Close edit task modal when the close button is clicked
    closeEditModalButton.addEventListener("click", function () {
      editTaskModal.style.display = "none";
      currentEditingTaskId = null; // Reset the current editing task ID
    });
  
    // Fetch tasks and add them to the list on page load
    function fetchTasks() {
      fetch("/task/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((response) => response.json())
        .then((tasks) => {
          tasks.forEach((task) => {
            addTaskToList(task);
          });
        })
        .catch((error) => {
          console.error("Error fetching tasks:", error);
        });
    }
  
    fetchTasks(); // Call the fetchTasks function on page load
  
    // Handle form submission to create a new task
    createTaskForm.addEventListener("submit", function (event) {
      event.preventDefault();
  
      const taskTitle = taskTitleInput.value;
  
      fetch("/task/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ title: taskTitle }),
      })
        .then((response) => response.json())
        .then((newTask) => {
          addTaskToList(newTask);
          taskTitleInput.value = ""; // Clear the input field
        })
        .catch((error) => {
          console.error("Error creating task:", error);
        });
    });
  
    // Logout button click event
    logoutButton.addEventListener("click", function () {
      // Clear the JWT token from local storage
      localStorage.removeItem("token");
      // Redirect to the login page
      window.location.href = "/login/";
    });
  
    // Function to delete a task
    function deleteTask(taskId) {
      fetch(`/task/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((response) => {
          if (response.status === 204) {
            removeTaskFromList(taskId);
          } else {
            throw new Error("Failed to delete task.");
          }
        })
        .catch((error) => {
          console.error("Error deleting task:", error);
        });
    }
  });
  