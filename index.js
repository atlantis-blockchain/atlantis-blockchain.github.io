function loadUrl(url) {
  document.getElementById("middle-item-1").src = url;
}

function showMenu() {
  var x = document.getElementById("topItem");
  if (x.className === "top-item") {
    x.className += " responsive";
  } else {
    x.className = "top-item";
  }
}
