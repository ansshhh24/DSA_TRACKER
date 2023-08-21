document.addEventListener("DOMContentLoaded", function () {
  const topicList = document.getElementById("topic-list");
  const totalCompletedElement = document.getElementById("total-completed");
  const topicInput = document.getElementById("topic-input");

  let totalCompleted = 0;
  const storedTopics = JSON.parse(localStorage.getItem("completedTopics")) || [];

  // Fetch topics and questions data from the JSON file
  fetch("/topics.json")
      .then(response => response.json())
      .then(data => {
          const topics = data;

          // Populate dropdown list with topics
          topics.forEach(topic => {
              const option = document.createElement("option");
              option.value = topic.name;
              option.textContent = topic.name;
              topicInput.appendChild(option);
          });

          // Rest of your code for displaying topics and questions
          topics.forEach(topic => {
              const listItem = document.createElement("li");
              listItem.innerHTML = `
                  <div class="topic-container">
                      <div class="topic-header">
                          <h3 class="topic-label">${topic.name}</h3>
                          <div class="arrow">&#9660;</div>
                      </div>
                  </div>
              `;

              const questionList = document.createElement("ul");
              questionList.classList.add("question-list");

              topic.questions.forEach((question, index) => {
                  const questionItem = document.createElement("li");
                  questionItem.innerHTML = `
                      <div class="question-bar">
                          <label>
                              <input type="checkbox" class="question-checkbox" data-topic="${topic.name}" data-index="${index}" ${storedTopics.includes(`${topic.name}-${index}`) ? "checked" : ""}>
                              ${question.title}
                          </label>
                      </div>
                  `;
                  questionList.appendChild(questionItem);
                  if (storedTopics.includes(`${topic.name}-${index}`)) {
                      totalCompleted++;
                      questionItem.querySelector(".question-bar").classList.add("completed");
                  }
              });

              listItem.querySelector(".topic-container").appendChild(questionList);

              listItem.querySelector(".topic-header").addEventListener("click", function () {
                  questionList.classList.toggle("active");
                  this.querySelector(".arrow").classList.toggle("active");
              });

              listItem.querySelectorAll(".question-checkbox").forEach(checkbox => {
                  checkbox.addEventListener("change", function () {
                      const questionIndex = parseInt(this.getAttribute("data-index"));
                      const questionKey = `${topic.name}-${questionIndex}`;
                      const questionBar = this.closest(".question-bar");
                      if (this.checked) {
                          storedTopics.push(questionKey);
                          totalCompleted++;
                          questionBar.classList.add("completed");
                      } else {
                          const index = storedTopics.indexOf(questionKey);
                          if (index !== -1) {
                              storedTopics.splice(index, 1);
                              totalCompleted--;
                              questionBar.classList.remove("completed");
                          }
                      }
                      localStorage.setItem("completedTopics", JSON.stringify(storedTopics));
                      updateTotalCompleted();
                  });
              });

              topicList.appendChild(listItem);
          });

          // Update total completed count
          updateTotalCompleted();
      })
      .catch(error => {
          console.error("Error fetching topics data:", error);
      });

  function updateTotalCompleted() {
      totalCompletedElement.textContent = `Total Problems Completed: ${totalCompleted}`;
  }

  // Form submission handling
  const questionForm = document.getElementById("question-form");

  questionForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const selectedTopic = topicInput.value;
      const questionInput = document.getElementById("question-input").value;

      // Create a new question object using the input values
      const newQuestion = {
          title: questionInput,
          link: "#" // You can add a link or leave it empty for now
      };

      // Find the selected topic in the topics array
      const topicToUpdate = topics.find(topic => topic.name === selectedTopic);

      // If the topic exists, push the new question to its questions array
      if (topicToUpdate) {
          topicToUpdate.questions.push(newQuestion);
          // Update the UI and localStorage
          updateTopicQuestions(topicToUpdate);
          localStorage.setItem("completedTopics", JSON.stringify(storedTopics));
          totalCompleted++;
          updateTotalCompleted();
      } else {
          alert("Topic not found in the topics array.");
      }

      // Clear the form fields after submission
      questionForm.reset();
  });

  function updateTopicQuestions(topic) {
      const topicName = topic.name;
      const topicElement = topicList.querySelector(`[data-topic="${topicName}"]`);

      if (topicElement) {
          const questionList = topicElement.querySelector(".question-list");
          if (questionList) {
              const questionItem = document.createElement("li");
              const lastIndex = topic.questions.length - 1;
              questionItem.innerHTML = `
                  <div class="question-bar">
                      <label>
                          <input type="checkbox" class="question-checkbox" data-topic="${topicName}" data-index="${lastIndex}" checked>
                          ${topic.questions[lastIndex].title}
                      </label>
                  </div>
              `;
              questionList.appendChild(questionItem);
          } else {
              console.log(`Question list not found for topic: ${topicName}`);
          }
      } else {
          console.log(`Topic element not found for topic: ${topicName}`);
      }
  }
});
