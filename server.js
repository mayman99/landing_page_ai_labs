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
const SDAPI_URL = "http://92.220.132.213:40045/sdapi/v1/upscale";

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

app.get('/robots.txt', function (req, res) {
    res.type('text/plain');
    res.send("User-agent: *\nAllow: /texture\nAllow: / ");
});

console.log(process.env.PORT);
/* Start the Server */
const server = http.createServer(app, (req,res) => {
    res.end("SSL ADDED");
})
.listen(process.env.PORT || 3000, () => console.log("Server is Running"));

/* Render LandingPage */
app.get("/", (req, res) => {
    if (!req.session.client_id) {
        req.session.client_id = uuid.v4();
      }

    const clientId = req.session.client_id;
    // Set the client_id as a cookie in the response
    res.cookie('client_id', clientId);

    // Set appropriate headers and send the response
    // res.setHeader('Content-Type', 'text/html');
    // res.setHeader('Set-Cookie', `client_id=${clientId}; Path=/`);
    console.log(clientId);
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
            cb(null, new Date().toISOString() + '-' + file.originalname);
        }
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
app.get('/download/:fileName', (req, res) => {
    const fileName = req.params.fileName;
  
    const params = {
      Bucket: 'satupscale',
      Key: fileName,
    };
  
    // Get the object from S3 and send it as an attachment
    S3.getObject(params, (err, data) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error downloading file.' });
      }
  
      res.attachment(fileName);
      res.send(data.Body);
    });
  });

app.post('/upload', upload.single('image'), function (req, res, next) {
    console.log(req);
    console.log('Uploaded!');
    res.send(req.file);
});

