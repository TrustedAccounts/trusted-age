const https = require("https");
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

// Configure JWKS client
const client = jwksClient({
  jwksUri:
    "https://stage-age.trustedaccounts.org/api/auth/.well-known/jwks.json", // Todo: Replace with trusted accounts server URL
});

// Middleware to get the signing key
function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) {
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

app.get("/styles.css", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "styles.css"))
);

// Endpoint to verify the token
app.post("/verify-token", (req, res) => {
  const token = req.body.token;

  if (!token) {
    return res.status(400).send("Token is required");
  }

  jwt.verify(token, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
    if (err) {
      console.error("Token verification failed:", err);
      // Serve access-denied.html
      return res
        .status(401)
        .sendFile(path.join(__dirname, "public", "access-denied.html"));
    }

    // Token is valid
    if (decoded && decoded.isOver18) {
      // Serve access-granted.html
      res.sendFile(path.join(__dirname, "public", "access-granted.html"));
    } else {
      // Serve access-denied.html
      res
        .status(403)
        .sendFile(path.join(__dirname, "public", "access-denied.html"));
    }
  });
});

// Serve index.html at the root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// HTTPS Setup
const httpsOptions = {
  key: fs.readFileSync("server.key"), // Path to your private key
  cert: fs.readFileSync("server.cert"), // Path to your certificate
};

const PORT = 4000;

// Start HTTPS server
https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`Express HTTPS server running on https://localhost:${PORT}`);
});
