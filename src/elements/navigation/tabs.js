// WAI-ARIA tabs: one tab stop for the list, arrows move between tabs,
// Home/End jump to the ends, selection follows focus.

const select = (tab) => {
  const list = tab.closest('[role="tablist"]');
  for (const other of list.querySelectorAll('[role="tab"]')) {
    const selected = other === tab;
    other.setAttribute("aria-selected", String(selected));
    other.tabIndex = selected ? 0 : -1;
    const panel = document.getElementById(other.getAttribute("aria-controls"));
    if (panel) panel.hidden = !selected;
  }
  tab.focus();
};

document.addEventListener("click", (event) => {
  const tab = event.target.closest?.('[role="tab"]');
  if (tab) select(tab);
});

document.addEventListener("keydown", (event) => {
  const tab = event.target.closest?.('[role="tab"]');
  if (!tab) return;
  const tabs = [
    ...tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]'),
  ];
  const index = tabs.indexOf(tab);
  const next = {
    ArrowRight: tabs[(index + 1) % tabs.length],
    ArrowLeft: tabs[(index - 1 + tabs.length) % tabs.length],
    Home: tabs[0],
    End: tabs[tabs.length - 1],
  }[event.key];
  if (next) {
    event.preventDefault();
    select(next);
  }
});
