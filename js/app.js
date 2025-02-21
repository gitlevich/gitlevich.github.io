// Simple script to handle smooth scrolling (if desired).
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
}

// You can also add form-handling or other logic here.
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".contact-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      // Basic example: just alert for now
      alert("Thanks! We will get in touch soon.");
      form.reset();
    });
  }
});
