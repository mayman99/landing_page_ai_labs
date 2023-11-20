require("dotenv").config();
const http = require("http");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");

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


// app.get('/sitemap.xml', async function(req, res, next){
//     let xml_content = [
//       '<?xml version="1.0" encoding="UTF-8"?>',
//       '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
//       '  <url>',
//       '    <loc>https://www.designfast.app/</loc>',
//       '    <lastmod>2023-11-11</lastmod>',
//       '  </url>',
//       '</urlset>'
//     ]
//     res.set('Content-Type', 'text/xml')
//     res.send(xml_content.join('\n'))
//   })

console.log(process.env.PORT);
/* Start the Server */
const server = http.createServer(app, (req,res) => {
    res.end("SSL ADDED");
})
.listen(process.env.PORT || 3000, () => console.log("Server is Running"));


/* Render LandingPage */
app.get("/", (req, res) => {
    res.render("index")
})
