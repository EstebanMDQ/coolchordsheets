// Live editor for the demo page. Uses the global CoolChordSheets from ./dist/coolchordsheets.js.
(function () {
  function init() {
    var source = document.getElementById("source");
    var preview = document.getElementById("preview");
    var holds = document.getElementById("opt-holds");
    var uneven = document.getElementById("opt-uneven");
    var size = document.getElementById("opt-size");
    var sizeLabel = document.getElementById("opt-size-label");
    if (!source || !preview) return;

    function update() {
      sizeLabel.textContent = size.value + " px";
      CoolChordSheets.render(source.value, preview, {
        showHolds: holds.checked,
        showUneven: uneven.checked,
        fontSize: Number(size.value),
      });
    }

    source.addEventListener("input", update);
    holds.addEventListener("input", update);
    uneven.addEventListener("input", update);
    size.addEventListener("input", update);
    update();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
