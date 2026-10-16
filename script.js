document.addEventListener("DOMContentLoaded", () => {
  // Render Lucide icons if the CDN is available.
  const renderIcons = () => {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  };
  renderIcons();

  const menuToggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("main-nav");
  const navLinks = document.querySelectorAll(".nav-link");

  const closeMenu = () => {
    nav.classList.remove("open");
    document.body.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    menuToggle.innerHTML = '<i data-lucide="menu"></i>';
    renderIcons();
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    document.body.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
    menuToggle.innerHTML = isOpen ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
    renderIcons();
  });

  navLinks.forEach(link => link.addEventListener("click", closeMenu));
  window.addEventListener("resize", () => {
    if (window.innerWidth > 800) closeMenu();
  });

  // Reveal elements as they enter the viewport; gracefully show all if unsupported.
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -30px 0px" });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("is-visible"));
  }

  // Update active navigation item while scrolling.
  const sections = document.querySelectorAll("main section[id], main section:not([id])");
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      if (!id) return;
      navLinks.forEach(link => {
        link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
      });
    });
  }, { rootMargin: "-35% 0px -55% 0px" });
  document.querySelectorAll("main section[id]").forEach(section => sectionObserver.observe(section));

  // Show the back-to-top control after the hero.
  const backToTop = document.getElementById("back-to-top");
  const updateBackToTop = () => backToTop.classList.toggle("visible", window.scrollY > 500);
  window.addEventListener("scroll", updateBackToTop, { passive: true });
  updateBackToTop();
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  document.getElementById("year").textContent = new Date().getFullYear();

  // Show the vocational skill choices only when the skill centre is selected.
  const programme = document.getElementById("programme");
  const skillOptions = document.getElementById("skill-options");
  programme.addEventListener("change", () => {
    const isVocational = programme.value.includes("Creativity & Skill Center");
    skillOptions.hidden = !isVocational;
    skillOptions.querySelectorAll('input[type="radio"]').forEach(input => {
      input.required = isVocational;
      if (!isVocational) input.checked = false;
    });
  });

  // This version prepares an email instead of pretending a form was delivered to a server.
const enquiryForm = document.getElementById("enquiry-form");
const formStatus = document.getElementById("form-status");

if (enquiryForm && formStatus) {
  enquiryForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!enquiryForm.reportValidity()) return;

    const formData = new FormData(enquiryForm);

    const payload = {
      studentName: String(formData.get("studentName") || "").trim(),
      programme: String(formData.get("programme") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      email: String(formData.get("email") || "").trim() || null,
      skill: String(formData.get("skill") || "").trim() || null,
      message: String(formData.get("message") || "").trim() || null,
    };

    const submitButton = enquiryForm.querySelector(
      'button[type="submit"], button:not([type])'
    );

    if (submitButton) submitButton.disabled = true;

    formStatus.textContent = "Submitting your enquiry...";

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/enquiries",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.detail || "Unable to submit your enquiry."
        );
      }

      formStatus.textContent =
        `${result.message} Reference: ${result.reference}`;

      enquiryForm.reset();

      const skillOptions = document.getElementById("skill-options");
      if (skillOptions) skillOptions.hidden = true;
    } catch (error) {
      console.error("Enquiry submission failed:", error);

      formStatus.textContent =
        "We could not submit your enquiry. Please try again or contact the school.";
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}
});
