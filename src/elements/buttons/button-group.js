document.addEventListener("click", (event) => {
  const button = event.target.closest?.(".btn-group [aria-pressed]");
  if (!button) return;
  const group = button.closest(".btn-group");
  if (group.hasAttribute("data-exclusive")) {
    for (const other of group.querySelectorAll("[aria-pressed]")) {
      other.setAttribute("aria-pressed", String(other === button));
    }
  } else {
    const pressed = button.getAttribute("aria-pressed") === "true";
    button.setAttribute("aria-pressed", String(!pressed));
  }
});
