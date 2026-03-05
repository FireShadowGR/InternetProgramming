// js/contact.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const nameInput = document.getElementById('contactName');
  const emailInput = document.getElementById('contactEmail');
  const subjectInput = document.getElementById('contactSubject');
  const messageInput = document.getElementById('contactMessage');

  const confirmName = document.getElementById('confirmName');
  const confirmEmail = document.getElementById('confirmEmail');
  const confirmSubject = document.getElementById('confirmSubject');
  const confirmMessage = document.getElementById('confirmMessage');

  const modalEl = document.getElementById('contactConfirmationModal');
  const modal = modalEl ? new bootstrap.Modal(modalEl) : null;

  form.addEventListener('submit', event => {
    event.preventDefault();
    event.stopPropagation();

    form.classList.add('was-validated');

    if (!form.checkValidity()) {
      return;
    }

    // Fill confirmation values
    confirmName.textContent = nameInput.value.trim();
    confirmEmail.textContent = emailInput.value.trim();
    confirmSubject.textContent = subjectInput.value.trim();
    confirmMessage.textContent = messageInput.value.trim();

    if (modal) {
      modal.show();
    }

    // Optionally clear form after showing confirmation
    form.reset();
    form.classList.remove('was-validated');
  });
});
