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
