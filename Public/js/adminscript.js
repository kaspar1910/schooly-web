const params = new URLSearchParams(window.location.search);
const status = params.get("status")
const messageBox = document.getElementById("upload-message");


if (messageBox){
    if (status == "success"){
        messageBox.textContent = "Upload Successfully";
    }
    else if (status == "error"){
        messageBox.textContent = "Error in upload route";
    }

    else {
        messageBox.textContent = "";
    }
}


document.addEventListener("DOMContentLoaded", function(){
    const fileList = document.getElementById("admin-file-list");

    if (!fileList){
        return console.log("No fileList found");
    }

    loadFiles();

    function loadFiles(){
        fetch("/api/files")
            .then(function(response) {
                return response.json();
            })
            .then(function(files) {
                fileList.innerHTML = "";

                if (files.length === 0) {
                    fileList.textContent = "No files found.";
                    return;
                }

                files.forEach(function(file){
                const row = document.createElement("div");
                row.textContent = file + " ";

                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete File";

                    deleteButton.addEventListener("click", function () {
                        deleteFile(file);
                    });

                    row.appendChild(deleteButton);
                    fileList.appendChild(row);
                });
            })
    }

    function deleteFile(fileName){
        fetch("/api/files/"+ encodeURIComponent(fileName),{
            method: "DELETE",
        })
            .then(function(response){
                return response.json();
            })
            .then(function(result) {
                if (result.success){
                    loadFiles();
                } else {
                    console.log("delete failed");
                }
            })
            .catch(function(){
                console.log("error");
            })
    }
})