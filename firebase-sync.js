(function () {
  "use strict";

  var freeModeMessage = "現在は無料運用のため、記録はこの端末に保存されます。機種変更や別端末同期は、必要になったタイミングで追加できます。";

  function patchFreeMode() {
    var cloudBox = document.getElementById("v10-cloud");
    if (!cloudBox) return;

    var section = cloudBox.closest("section");
    var title = section && section.querySelector("h2");
    if (title) title.textContent = "設定・端末内保存";
    cloudBox.innerHTML = "<p>" + freeModeMessage + "</p>";
  }

  var timer = window.setInterval(patchFreeMode, 300);
  window.addEventListener("load", function () {
    patchFreeMode();
    window.setTimeout(function () {
      window.clearInterval(timer);
      patchFreeMode();
    }, 5000);
  });
})();
