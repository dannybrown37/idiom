const update = (output) => {
  const field = document.getElementById(output.dataset.countFor);
  if (field) output.value = `${field.value.length} / ${field.maxLength}`;
};

for (const output of document.querySelectorAll("[data-count-for]")) {
  update(output);
}

document.addEventListener("input", (event) => {
  const output = document.querySelector(
    `[data-count-for="${event.target.id}"]`,
  );
  if (output) update(output);
});
