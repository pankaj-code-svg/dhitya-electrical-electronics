const BUSINESS_PHONE = "919892223002";

const bookingForm = document.querySelector("#bookingForm");
const bookingStatus = document.querySelector("#bookingStatus");
const bookingLoading = document.querySelector("#bookingLoading");
const reviewForm = document.querySelector("#reviewForm");
const reviewStatus = document.querySelector("#reviewStatus");
const reviewList = document.querySelector("#reviewList");
const reviewRating = document.querySelector("#reviewRating");
const starRating = document.querySelector("#starRating");
const chatToggle = document.querySelector("#chatToggle");
const chatGreeting = document.querySelector("#chatGreeting");
const chatPanel = document.querySelector("#chatPanel");
const chatClose = document.querySelector("#chatClose");
const chatMessages = document.querySelector("#chatMessages");
const chatForm = document.querySelector("#chatForm");
const chatText = document.querySelector("#chatText");
const callLink = document.querySelector("#callLink");
const whatsappLink = document.querySelector("#whatsappLink");

if (callLink) {
  callLink.href = `tel:+${BUSINESS_PHONE}`;
}

if (whatsappLink) {
  whatsappLink.href = `https://wa.me/${BUSINESS_PHONE}`;
}

function getStoredList(key) {
  return JSON.parse(localStorage.getItem(key) || "[]");
}

function saveStoredList(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function setError(field, message) {
  const fieldGroup = field.closest("label, fieldset");
  const error = fieldGroup.querySelector(".error-message");

  if (error) {
    error.textContent = message;
  }

  field.setAttribute("aria-invalid", message ? "true" : "false");
}

function cleanPhone(phone) {
  return phone.replace(/\D/g, "");
}

function validateRequired(field, label) {
  if (!field.value.trim()) {
    setError(field, `${label} is required.`);
    return false;
  }

  setError(field, "");
  return true;
}

function validatePhone(field) {
  const phone = cleanPhone(field.value);

  if (phone.length !== 10) {
    setError(field, "Enter a valid 10-digit mobile number after +91.");
    return false;
  }

  setError(field, "");
  return true;
}

function validateServiceArea(field) {
  if (!validateRequired(field, "Service area")) {
    return false;
  }

  if (field.value !== "Thane West") {
    setError(field, "Booking is available only in Thane West.");
    return false;
  }

  setError(field, "");
  return true;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showStatus(element, message, success = false) {
  element.textContent = message;
  element.classList.toggle("success", success);
}

function showBookingConfirmation(booking) {
  const message = [
    "New booking for Dhitya Electrical & Electronics:",
    "",
    `Service: ${booking.service}`,
    `Area: ${booking.area}`,
    `Name: ${booking.name}`,
    `Phone: ${booking.phone}`,
    `Address: ${booking.address}`,
    `Booking Time: ${booking.createdAt}`,
  ].join("\n");
  const whatsappUrl = `https://wa.me/${BUSINESS_PHONE}?text=${encodeURIComponent(message)}`;
  const whatsappWindow = window.open(whatsappUrl, "_blank");

  bookingStatus.textContent = "WhatsApp is opening with your booking details. Please press Send.";
  bookingStatus.classList.add("success");

  if (whatsappWindow) {
    whatsappWindow.opener = null;
    return;
  }

  window.location.href = whatsappUrl;
}

function showBookingLoading() {
  if (!bookingLoading) {
    return;
  }

  bookingForm.classList.add("is-loading");
  bookingLoading.hidden = false;
}

function hideBookingLoading() {
  if (!bookingLoading) {
    return;
  }

  bookingLoading.hidden = true;
  bookingForm.classList.remove("is-loading");
}

function notifyOwner(booking) {
  const message = `New booking: ${booking.service} for ${booking.name}, area ${booking.area}, phone ${booking.phone}, address ${booking.address}`;

  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Dhitya Electrical & Electronics booking", { body: message });
  }

  console.info(message);
}

if ("Notification" in window && Notification.permission === "default") {
  Notification.requestPermission();
}

if (bookingForm) {
  const serviceType = document.querySelector("#serviceType");
  const selectedService = new URLSearchParams(window.location.search).get("service");
  const confirmBookingButton = bookingForm.querySelector('button[type="submit"]');

  if (selectedService && serviceType) {
    serviceType.value = selectedService;
  }

  const customerPhone = document.querySelector("#customerPhone");

  if (customerPhone) {
    customerPhone.addEventListener("input", () => {
      customerPhone.value = cleanPhone(customerPhone.value).slice(0, 10);
    });
  }

  const serviceArea = document.querySelector("#serviceArea");

  if (serviceArea) {
    const updateServiceAreaState = () => {
      if (serviceArea.value === "Outside Thane West") {
        confirmBookingButton.disabled = true;
        setError(serviceArea, "Service is not available outside Thane West.");
        showStatus(bookingStatus, "Service is not available outside Thane West. Please choose Thane West to book.");
        return;
      }

      confirmBookingButton.disabled = false;
      setError(serviceArea, "");
      showStatus(bookingStatus, "");
    };

    serviceArea.addEventListener("change", updateServiceAreaState);
    updateServiceAreaState();
  }

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.querySelector("#customerName");
    const phone = document.querySelector("#customerPhone");
    const area = document.querySelector("#serviceArea");
    const address = document.querySelector("#customerAddress");
    const service = document.querySelector("#serviceType");

    const isValid = [
      validateRequired(name, "Name"),
      validatePhone(phone),
      validateServiceArea(area),
      validateRequired(address, "Address"),
      validateRequired(service, "Service"),
    ].every(Boolean);

    if (!isValid) {
      if (area.value === "Outside Thane West") {
        showStatus(bookingStatus, "Service is not available outside Thane West. Please contact us for more details.");
        return;
      }

      showStatus(bookingStatus, "Please complete all required details before confirming.");
      return;
    }

    if (service.value === "Small Electrical Work") {
      showStatus(bookingStatus, "For small electrical work, please contact us directly first.");
      window.location.href = "contact.html";
      return;
    }

    const booking = {
      name: name.value.trim(),
      phone: `+91${cleanPhone(phone.value)}`,
      area: area.value,
      address: address.value.trim(),
      service: service.value,
      createdAt: new Date().toLocaleString(),
    };

    const bookings = getStoredList("dhityaBookings");
    bookings.push(booking);
    saveStoredList("dhityaBookings", bookings);
    notifyOwner(booking);

    showBookingLoading();

    setTimeout(() => {
      hideBookingLoading();
      showBookingConfirmation(booking);
      bookingForm.reset();
    }, 3000);
  });
}

function renderReviews() {
  const reviews = getStoredList("dhityaReviews");

  if (reviews.length === 0) {
    reviewList.innerHTML = '<div class="review-item"><strong>No reviews yet</strong><p>Your customer reviews will appear here.</p></div>';
    return;
  }

  reviewList.innerHTML = reviews
    .map(
      (review) => `
        <article class="review-item">
          <strong>${escapeHtml(review.name)}</strong>
          <span>${"\u2605".repeat(Number(review.rating))}${"\u2606".repeat(5 - Number(review.rating))}</span>
          <p>${escapeHtml(review.text)}</p>
        </article>
      `
    )
    .join("");
}

function updateStarRating(rating) {
  reviewRating.value = rating;
  starRating.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.rating) <= Number(rating));
  });
}

if (reviewForm && starRating && reviewRating) {
  starRating.addEventListener("click", (event) => {
    const button = event.target.closest("button");

    if (!button) {
      return;
    }

    updateStarRating(button.dataset.rating);
    setError(reviewRating, "");
  });

  reviewForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.querySelector("#reviewName");
    const text = document.querySelector("#reviewText");

    const isValid = [
      validateRequired(name, "Name"),
      validateRequired(reviewRating, "Rating"),
      validateRequired(text, "Review"),
    ].every(Boolean);

    if (!isValid) {
      showStatus(reviewStatus, "Please complete every review field.");
      return;
    }

    const reviews = getStoredList("dhityaReviews");
    const review = {
      name: name.value.trim(),
      rating: reviewRating.value,
      text: text.value.trim(),
    };

    reviews.unshift(review);

    saveStoredList("dhityaReviews", reviews);
    showStatus(reviewStatus, "Review added successfully. Thank you for your feedback.", true);
    reviewForm.reset();
    updateStarRating("");
    renderReviews();
  });

  renderReviews();
}

function addMessage(text, sender = "bot") {
  const bubble = document.createElement("div");
  bubble.className = `message ${sender}`;
  bubble.textContent = text;
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function botReply(input) {
  const text = input.toLowerCase();

  if (text.includes("tv")) {
    return "We handle TV repairing. Open Services, click Book service under TV Repairing, then enter your name, number, address, and service.";
  }
  if (text.includes("ac")) {
    return "We handle AC repairing. Open Services, click Book service under AC Repairing, then enter your name, number, address, and service.";
  }
  if (text.includes("inverter") || text.includes("battery")) {
    return "We repair inverters and install or replace inverter batteries. Please book the matching service.";
  }
  if (text.includes("wire") || text.includes("electric") || text.includes("house")) {
    return "For house wiring and small electrical work, please contact us directly by call or WhatsApp.";
  }
  if (text.includes("price") || text.includes("charge") || text.includes("cost")) {
    return "Price depends on the problem and location. Please share details through booking or contact us directly.";
  }
  if (text.includes("book")) {
    return "Open Services and click Book service under the service you need. Booking confirms only after all required details are complete.";
  }
  if (text.includes("contact") || text.includes("phone") || text.includes("call")) {
    return "Use the Contact page to call or WhatsApp Dhitya Electrical & Electronics directly.";
  }

  return "I can help with TV repair, AC repair, inverter repair, battery installation, old battery replacement, inverter wiring, and contact guidance.";
}

if (chatToggle && chatPanel && chatClose && chatForm && chatText && chatMessages) {
  const openChat = () => {
    chatPanel.hidden = false;
    chatToggle.hidden = true;
    if (chatGreeting) {
      chatGreeting.hidden = true;
    }

    if (chatMessages.children.length === 0) {
      addMessage("Hello, welcome to Dhitya Electrical & Electronics. How can I help you?");
    }
  };

  chatToggle.addEventListener("click", openChat);

  if (chatGreeting) {
    chatGreeting.addEventListener("click", openChat);

    setTimeout(() => {
      if (!chatPanel.hidden || chatGreeting.hidden) {
        return;
      }

      chatGreeting.hidden = true;
    }, 9000);
  }

  chatClose.addEventListener("click", () => {
    chatPanel.hidden = true;
    chatToggle.hidden = false;
  });

  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = chatText.value.trim();

    if (!text) {
      return;
    }

    addMessage(text, "user");
    chatText.value = "";
    setTimeout(() => addMessage(botReply(text)), 250);
  });
}
