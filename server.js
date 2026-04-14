const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const fsp = require("fs/promises");
const session = require("express-session");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

const publicFolder = path.join(__dirname, "Public");
const privateFolder = path.join(__dirname, "private");
const dataFolder = process.env.DATA_FOLDER || path.join(__dirname, "data");

if (!SESSION_SECRET || !ADMIN_PASSWORD_HASH) {
    throw new Error("Missing SESSION_SECRET or ADMIN_PASSWORD_HASH in .env");
}

fs.mkdirSync(dataFolder, { recursive: true });

console.log(`Using data folder: ${dataFolder}`);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, dataFolder);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });

app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: false }));

app.use(
    session({
        name: "schooly.sid",
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: "auto",
            maxAge: 60 * 60 * 1000
        }
    })
);

function requireAdmin(req, res, next) {
    if (req.session && req.session.isAdmin) {
        return next();
    }
    return res.redirect("/login.html");
}

/* ---------- PUBLIC PAGES ---------- */

app.get("/", function (req, res) {
    return res.sendFile(path.join(publicFolder, "index.html"));
});

app.get("/index.html", function (req, res) {
    return res.sendFile(path.join(publicFolder, "index.html"));
});

app.get("/login.html", function (req, res) {
    if (req.session && req.session.isAdmin) {
        return res.redirect("/admin.html");
    }
    return res.sendFile(path.join(publicFolder, "login.html"));
});

/* ---------- AUTH ---------- */

app.post("/login", async function (req, res) {
    const password = req.body.password || "";
    const ok = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    if (!ok) {
        return res.redirect("/login.html");
    }

    req.session.regenerate(function () {
        req.session.isAdmin = true;
        req.session.save(function () {
            return res.redirect("/admin.html");
        });
    });
});

app.post("/logout", function (req, res) {
    req.session.destroy(function () {
        res.clearCookie("schooly.sid");
        return res.redirect("/");
    });
});

/* ---------- PRIVATE ADMIN PAGE ---------- */

app.get("/admin.html", requireAdmin, function (req, res) {
    return res.sendFile(path.join(privateFolder, "admin.html"));
});

/* ---------- ADMIN ACTIONS ---------- */

app.post("/upload", requireAdmin, upload.single("htmlFile"), function (req, res) {
    if (!req.file) {
        return res.redirect("/admin.html?status=error");
    }

    return res.redirect("/admin.html?status=success");
});

app.delete("/api/files/:filename", requireAdmin, async function (req, res) {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(dataFolder, filename);

    await fsp.unlink(filePath);
    return res.json({ success: true });
});

/* ---------- PUBLIC FILE LIST ---------- */

app.get("/api/files", async function (req, res) {
    const files = await fsp.readdir(dataFolder);
    const htmlFiles = files.filter(function (file) {
        return file.toLowerCase().endsWith(".html");
    });

    return res.json(htmlFiles);
});

/* ---------- STATIC ---------- */

app.use(express.static(publicFolder));
app.use("/downloads", express.static(dataFolder));
app.use("/uploads", express.static(dataFolder));

app.listen(PORT, function () {
    console.log(`Server running at http://localhost:${PORT}`);
});