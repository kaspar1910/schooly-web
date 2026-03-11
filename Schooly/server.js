const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const app = express();
const PORT = 3000;

const publicFolder = path.join(__dirname, "Public")
const dataFolder = "C:\\Users\\kaspa\\Desktop\\Schooly-repo\\SchoolyData";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, dataFolder);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})

const upload = multer({ storage: storage });

app.post("/upload", upload.single("htmlFile"), function (req, res){
    if(!req.file){
        return res.redirect("/admin.html?status=error");
    }

    return res.redirect("/admin.html?status=success");
});

app.use(express.static(publicFolder));
app.use("/downloads", express.static(dataFolder));
app.use("/uploads", express.static(dataFolder));

app.get("/api/files", function(req,res){
    fs.readdir(dataFolder, function(err, files){
        if(err){
            return res.send("Error reading files");
        }

        const htmlFiles = files.filter(function (file){
            return file.toLowerCase().endsWith(".html");
        })

        res.json(htmlFiles);
    })
})


app.delete("/api/files/:filename", function(req, res){
    const filename = req.params.filename;
    const filePath = path.join(dataFolder, filename);

    fs.unlink(filePath, function(err){
        if (err) {
            return res.send(err);
        }
        res.json({success:true});
    })
})



app.listen(PORT, () => {
    console.log('server running at http://localhost:3000');
});