const input = document.getElementById("text");
const frame = document.querySelector("iframe");

window.openPage = function () {
    let value = input.value.trim();
    if (value === "") return;

    if (!value.startsWith("http://") && !value.startsWith("https://")) {
        value = "https://www.bing.com/search?q=" + encodeURIComponent(value);
    }

    frame.src = value;
};

input.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        window.openPage();
    }
});
