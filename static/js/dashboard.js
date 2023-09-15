document.addEventListener("DOMContentLoaded", function () {
  const createTaskForm = document.getElementById("create-task-form");
  const taskTitleInput = document.getElementById("task-title");
  const taskCardsContainer = document.getElementById("task-cards");
  const logoutButton = document.getElementById("logout-button");
  const editTaskModal = document.getElementById("edit-task-modal");
  const closeEditModalButton = document.getElementById("close-edit-modal");
  const editedTaskTitleInput = document.getElementById("edited-task-title");
  const editTaskForm = document.getElementById("edit-task-form");

  let currentEditingTaskId = null;
  
  // Function to create a task card element
  function createTaskCardElement(task) {
    const card = document.createElement("div");
    card.classList.add("card", "mb-3");
    card.dataset.taskId = task.id; // Store task ID as a data attribute

    const cardBody = document.createElement("div");
    cardBody.classList.add("card-body");

    const taskTitleElement = document.createElement("h5");
    taskTitleElement.classList.add("card-title");
    taskTitleElement.textContent = task.title;

    const buttonGroup = document.createElement("div");
    buttonGroup.classList.add("btn-group");
    buttonGroup.setAttribute("role", "group");

    const editButton = document.createElement("button");
    editButton.classList.add("btn", "btn-warning", "edit-button");
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => openEditModal(task.id));

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("btn", "btn-danger", "delete-button");
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    buttonGroup.appendChild(editButton);
    buttonGroup.appendChild(deleteButton);

    cardBody.appendChild(taskTitleElement);
    cardBody.appendChild(buttonGroup);

    card.appendChild(cardBody);

    return card;
  }

  // Function to add a new task card to the container
  function addTaskToCards(task) {
    const taskCard = createTaskCardElement(task);
    taskCardsContainer.appendChild(taskCard);
  }

  // Function to update a task card
  function updateTaskCard(taskId, newTitle) {
    const card = taskCardsContainer.querySelector(`.card[data-task-id="${taskId}"]`);
    if (card) {
      card.querySelector(".card-title").textContent = newTitle;
    }
  }

  // Function to remove a task card
  function removeTaskCard(taskId) {
    const card = taskCardsContainer.querySelector(`.card[data-task-id="${taskId}"]`);
    if (card) {
      card.remove();
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

          // Update the content of the task card on the page
          updateTaskCard(currentEditingTaskId, editedTaskTitle);
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

  // Fetch tasks and add them to the card container on page load
  function fetchTasks() {
    fetch("/task/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => response.json())
      .then((tasks) => {
        // Clear existing task cards before adding new ones
        taskCardsContainer.innerHTML = "";
        tasks.forEach((task) => {
          addTaskToCards(task);
        });
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
      });
  }

  // Call the fetchTasks function on page load to populate task list
  fetchTasks();

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
        addTaskToCards(newTask);
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
          removeTaskCard(taskId);
        } else {
          throw new Error("Failed to delete task.");
        }
      })
      .catch((error) => {
        console.error("Error deleting task:", error);
      });
  }
});
