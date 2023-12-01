require("dotenv").config();
const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const uuid = require('uuid');

const multer = require('multer');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const path = require("path");

/* Setup application */
const app = express();
app.use(express.json());
app.use(cors());

app.use(cors({
origin: '*'
}));

/* Setup view engine EJS, body-parser and express-static */
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static("public"));

/* Setup session */
app.use(
session({
secret: 'secretly',
resave: false,
saveUninitialized: false,
})
);

// app.get('/robots.txt', function (req, res) {
// res.type('text/plain');
// res.send("User-agent: *\nAllow: /texture\nAllow: / ");
// });

// app.get('/sitemap.xml', async function(req, res, next){
//     let xml_content = [
// '<?xml version="1.0" encoding="UTF-8"?>',
// '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
// '  <url>',
// '    <loc>https://www.resolutionboost.com/</loc>',
// '    <lastmod>2023-11-11</lastmod>',
// '  </url>',
// '</urlset>'
// ]
//     res.set('Content-Type', 'text/xml')
// res.send(xml_content.join('\n'))
// });

/* Start the Server */
const server = http.createServer(app, (req,res) => {
res.end("SSL ADDED");
})
.listen(process.env.PORT || 5500, () => console.log("Server is Running"));

/* Render LandingPage */
app.get("/", (req, res) => {
if (!req.session.client_id) {
req.session.client_id = uuid.v4();
}
    const clientId = req.session.client_id;
res.cookie('client_id', clientId);

res.render("index")
})

// CONFIGURATION OF S3
AWS.config.update({
secretAccessKey: 'AoZB1aSQDjspP3XfzFxY4L/Zgis2ZNckS0fq7HPi',
accessKeyId: "AKIAT4UQTLJVAI4GD256",
region: 'us-east-1'
});

// CREATE OBJECT FOR S3
const S3 = new AWS.S3();

// CREATE MULTER FUNCTION FOR UPLOAD
var upload = multer({
// CREATE MULTER-S3 FUNCTION FOR STORAGE
storage: multerS3({
s3: S3,
// bucket - WE CAN PASS SUB FOLDER NAME ALSO LIKE 'bucket-name/sub-folder1'
bucket: 'satupscale',
// META DATA FOR PUTTING FIELD NAME
metadata: function (req, file, cb) {
cb(null, { fieldName: file.fieldname });
},
// SET / MODIFY ORIGINAL FILE NAME
key: function (req, file, cb) {
// cb(null, file.originalname); //set unique file name if you wise using Date.toISOString()
// EXAMPLE 1
// cb(null, Date.now() + '-' + file.originalname);
// EXAMPLE 2
cb(null, new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-') + '-' + file.originalname);        }
}),
// SET DEFAULT FILE SIZE UPLOAD LIMIT
limits: { fileSize: 1024 * 1024 * 1000 }, // 1000MB
// FILTER OPTIONS LIKE VALIDATING FILE EXTENSION
fileFilter: function(req, file, cb) {
const filetypes = /jpeg|jpg|png|tif/;
const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
const mimetype = filetypes.test(file.mimetype);
if (mimetype && extname) {
return cb(null, true);
} else {
cb("Error: Allow images only of extensions jpeg|jpg|png|tif !");
}
    }
});

// Download route
app.get('/download/:fileName', async (req, res) => {
const fileName = req.params.fileName;

const params = {
Bucket: 'satupscale',
Key: fileName,
Expires: 60 * 5 // The signed URL will be valid for 5 minutes
};

// Generate a pre-signed URL
const url = S3.getSignedUrl('getObject', params);

// Redirect the client to the pre-signed URL
res.redirect(url);

// Delete the file after it has been downloaded
await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for 10 seconds to ensure the file has been downloaded

const deleteParams = {
Bucket: 'satupscale',
Key: fileName
};

S3.deleteObject(deleteParams, function(err, data) {
if (err) console.log(err, err.stack);  // error
else     console.log("Successfully deleted file from bucket"); // deleted
});
});

app.post('/upload', upload.single('image'), function (req, res, next) {
console.log(req);
console.log('Uploaded!');
res.send(req.file);
});

