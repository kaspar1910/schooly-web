document.addEventListener("DOMContentLoaded", function() {
    const fileList = document.getElementById("downloads-list");

    if (!fileList) {
        return console.log("No fileList found");
    }

    loadFiles();

    function loadFiles() {
        fetch("/api/files")
            .then(function (response) {
                return response.json();
            })
            .then(function (files) {
                fileList.innerHTML = "";

                if (files.length === 0) {
                    fileList.textContent = "No files found.";
                    return;
                }

                files.forEach(function (file) {
                    const row = document.createElement("div");
                    row.className = "download-row";

                    const downloadText = document.createElement("p");
                    downloadText.className = "download-text";
                    downloadText.textContent = file;

                    const downloadLink = document.createElement("a");
                    downloadLink.className = "download-link"
                    downloadLink.textContent = "Download";
                    downloadLink.href = "/downloads/" + encodeURIComponent(file);
                    downloadLink.download = file;

                    row.appendChild(downloadText)
                    row.appendChild(downloadLink);
                    fileList.appendChild(row);
                });
            });
    }
})


document.addEventListener("DOMContentLoaded", function () {
    const gogoPart = document.querySelector(".gogo-part");

    if (!gogoPart) {
        return;
    }

    document.addEventListener("mousemove", function (event) {
        const rect = gogoPart.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = event.clientX - centerX;
        const dy = event.clientY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const maxDistance = 260;
        const intensity = Math.max(0, 1 - distance / maxDistance);

        const glowSize = 0.18 + intensity * 2;
        const glowOpacity = 0.04 + intensity * 0.18;
        const brightness = 1 + intensity * 0.25;

        gogoPart.style.textShadow =
        `0 0 ${glowSize}rem rgba(210, 220, 230, ${glowOpacity}),
         0 0 ${glowSize * 1.8}rem rgba(180, 190, 200, ${glowOpacity * 0.65}),
        0 0.12rem 0.28rem rgba(0, 0, 0, 0.28)`;

        gogoPart.style.filter = `brightness(${brightness})`;
        gogoPart.style.transform = `none`;
    });
});
