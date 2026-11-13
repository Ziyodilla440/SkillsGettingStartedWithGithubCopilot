document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Show a status message helper
  function showMessage(text, isSuccess) {
    messageDiv.textContent = text;
    messageDiv.className = isSuccess ? "success" : "error";
    messageDiv.classList.remove("hidden");
    setTimeout(() => {
      messageDiv.classList.add("hidden");
    }, 5000);
  }

  // Handle unregistering a participant
  async function unregisterParticipant(activityName, email) {
    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activityName)}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, true);
        fetchActivities();
      } else {
        showMessage(result.detail || "Failed to unregister.", false);
      }
    } catch (error) {
      showMessage("Error unregistering participant.", false);
      console.error("Error unregistering:", error);
    }
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Save selected activity if any
      const selectedActivity = activitySelect.value;
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Create participants list HTML
        let participantsHtml = "";
        if (details.participants && details.participants.length > 0) {
          const listItems = details.participants
            .map(
              (p) => `
              <li class="participant-item">
                <span>${p}</span>
                <button type="button" class="delete-participant-btn" title="Unregister participant" data-activity="${name}" data-email="${p}">
                  &times;
                </button>
              </li>`
            )
            .join("");
          participantsHtml = `<ul class="participants-list">${listItems}</ul>`;
        } else {
          participantsHtml = '<p class="no-participants">No participants yet</p>';
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-section">
            <strong>Participants:</strong>
            ${participantsHtml}
          </div>
        `;

        // Attach unregister click handlers
        activityCard.querySelectorAll(".delete-participant-btn").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.preventDefault();
            const act = btn.getAttribute("data-activity");
            const em = btn.getAttribute("data-email");
            unregisterParticipant(act, em);
          });
        });

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        if (name === selectedActivity) {
          option.selected = true;
        }
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        showMessage(result.message, true);
        signupForm.reset();
        // Refresh the activities immediately so user sees the change
        fetchActivities();
      } else {
        showMessage(result.detail || "An error occurred", false);
      }
    } catch (error) {
      showMessage("Failed to sign up. Please try again.", false);
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
