(function () {
  var SELECTOR = ".entry-content img, .comment-body img";

  function meaningful(node) {
    if (node.nodeType === 3) return node.textContent.trim().length > 0;
    if (node.nodeType !== 1) return false;
    return node.tagName !== "BR";
  }

  function stripFloat(img) {
    img.removeAttribute("align");
    img.removeAttribute("hspace");
    img.classList.remove("alignleft", "alignright");
    if (img.getAttribute("style")) img.style.float = "none";
  }

  function layoutWidth(img) {
    if (img.naturalWidth) return img.naturalWidth;
    var declared = parseInt(img.getAttribute("width"), 10);
    return declared || 0;
  }

  function fix(img) {
    if (layoutWidth(img) <= 300) return;
    if (img.closest(".wide-figure")) {
      stripFloat(img);
      return;
    }
    stripFloat(img);
    var node = img;
    var parent = node.parentElement;
    if (parent && parent.tagName === "A" && !parent.textContent.trim()) {
      node = parent;
      parent = node.parentElement;
    }
    if (!parent || parent.tagName === "TD" || parent.tagName === "TH") {
      img.style.display = "block";
      return;
    }
    var children = Array.prototype.slice.call(parent.childNodes);
    var only = children.filter(meaningful);
    if (only.length === 1 && only[0] === node) {
      if (parent.tagName === "P") parent.classList.add("wide-figure");
      else img.style.display = "block";
      return;
    }
    var seen = false;
    var beforeEmpty = true;
    var after = [];
    children.forEach(function (child) {
      if (child === node) {
        seen = true;
        return;
      }
      if (!seen) {
        if (meaningful(child)) beforeEmpty = false;
      } else {
        after.push(child);
      }
    });
    var figure = document.createElement("p");
    figure.className = "wide-figure";
    var tail = null;
    if (after.some(meaningful)) {
      tail = document.createElement(parent.tagName.toLowerCase());
      after.forEach(function (child) { tail.appendChild(child); });
    }
    parent.insertAdjacentElement("afterend", figure);
    figure.appendChild(node);
    if (tail) figure.insertAdjacentElement("afterend", tail);
    if (beforeEmpty) parent.remove();
  }

  function run() {
    document.querySelectorAll(SELECTOR).forEach(function (img) {
      if (img.complete) fix(img);
      else img.addEventListener("load", function () { fix(img); });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
