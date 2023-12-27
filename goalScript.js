// goal
let selectedLesson = null;
let lessonCards = document.querySelectorAll(".lesson-card");
let videoElement = document.querySelector("webcam");

function handleLessonSelect(lesson) {
  if (selectedLesson === lesson) return;

  selectedLesson = lesson;

  // Remove checkmark from all cards
  document.querySelectorAll(".lesson-card").forEach((card) => {
    card.querySelector(".check-icon").style.display = "none";
  });

  // Display checkmark on selected card
  const selectedCard = document.querySelector(
    `[onclick="handleLessonSelect('${lesson}')"`
  );
  selectedCard.querySelector(".check-icon").style.display = "block";
}

function handleContinue() {
  if (!selectedLesson) {
    alert("Please select a lesson");
  } else {
    window.location.href = `./question.html?lesson=${selectedLesson}`;
  }
}
