//Express app

var express = require("express"),
  app = express(),
  port = process.env.PORT || 5000;
app.listen(port);
var path = require("path");
app.use(express.static(path.join(__dirname, "public")));

//Firebase us only used fot storing and fetching device tokens to identify the devices.
const { initializeApp } = require("firebase-admin/app");
var admin = require("firebase-admin");

var serviceAccount = require("./unibook-ce148-firebase-adminsdk-ngpl3-f52d3446b0.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://unibook-ce148-default-rtdb.europe-west1.firebasedatabase.app",
});

//Serve static content

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

//Api call for sending push notification
app.get("/push", (req, res) => {
  const url = req.protocol + "://" + req.get("host") + req.originalUrl;
  const params = new URL(url);
  var message = params.searchParams.get("message");
  var deviceT = [];

  var db = admin.database();
  var ref = db.ref("APN");
  ref.once("value", function (snapshot) {
    for (const [key, value] of Object.entries(snapshot.val())) {
      deviceT.push(value);
    }

    var apn = require("apn");
    var join = require("path").join,
      pfx = join(__dirname, "/PushCertificates.p12");

    var options = {
      pfx: pfx,
      passphrase: "",
      production: true,
    };

    var apnProvider = new apn.Provider(options);
    var finalMessage = "";
    let notification = new apn.Notification();
    notification.alert = message;
    notification.topic = "CALIELSA-BOOKAPN.UniBookApp";

    //Send push to all devices that accepted push notifications
    deviceT.forEach(function (x) {
      apnProvider.send(notification, [x]).then((response) => {});
    });
  });
});
