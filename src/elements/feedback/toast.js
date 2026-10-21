const CLOSE_ICON =
  '<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2l-8 8"/></svg>';

const dismiss = (toast) => {
  clearTimeout(toast.timer);
  toast.remove();
};

// Hovering or focusing a toast pauses its timer, so nobody loses a message
// they're in the middle of reading.
const arm = (toast) => {
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => dismiss(toast), 5000);
};

export function showToast(message, tone) {
  const region = document.querySelector(".toast-region");
  if (!region) return;
  const toast = document.createElement("div");
  toast.className = tone ? `toast toast-${tone}` : "toast";
  const text = document.createElement("span");
  text.textContent = message;
  const close = document.createElement("button");
  close.type = "button";
  close.className = "toast-close";
  close.setAttribute("aria-label", "Dismiss");
  close.innerHTML = CLOSE_ICON;
  close.addEventListener("click", () => dismiss(toast));
  toast.append(text, close);
  toast.addEventListener("pointerenter", () => clearTimeout(toast.timer));
  toast.addEventListener("pointerleave", () => arm(toast));
  toast.addEventListener("focusin", () => clearTimeout(toast.timer));
  toast.addEventListener("focusout", () => arm(toast));
  region.append(toast);
  arm(toast);
  return toast;
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest?.("[data-toast]");
  if (trigger) showToast(trigger.dataset.toast, trigger.dataset.toastTone);
});
