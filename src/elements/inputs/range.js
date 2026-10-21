const sync = (range) => {
  const span = range.max - range.min || 100;
  range.style.setProperty(
    "--fill",
    `${((range.value - range.min) / span) * 100}%`,
  );
  const output = document.querySelector(`output[for="${range.id}"]`);
  if (output) output.value = range.value;
};

for (const range of document.querySelectorAll(".range")) sync(range);

document.addEventListener("input", (event) => {
  if (event.target.matches?.(".range")) sync(event.target);
});
