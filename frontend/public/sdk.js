const domain = "https://stage-age.trustedaccounts.org";

(function (window) {
  // Create an iframe to the token provider
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = domain + "/token-provider.html";
  document.body.appendChild(iframe);

  // Flag to check if the iframe is ready
  let iframeReady = false;
  iframe.onload = function () {
    iframeReady = true;
    console.log("Iframe loaded and ready.");
  };

  // Function to get the token via postMessage
  function getToken(callback) {
    console.log("Requesting token...");
    if (!iframeReady) {
      iframe.onload = function () {
        iframeReady = true;
        console.log("Iframe loaded and ready.");
        requestToken(callback);
      };
    } else {
      requestToken(callback);
    }
  }

  function requestToken(callback) {
    console.log("Sending message to iframe to request token.");
    // Send a message to the iframe to request the token
    iframe.contentWindow.postMessage("getToken", domain);

    // Set up a listener to receive the token
    function receiveMessage(event) {
      if (event.origin !== domain) return;

      // Remove the listener after receiving the token
      window.removeEventListener("message", receiveMessage);

      const token = event.data.token;
      console.log("Token received:", token);
      callback(token);
    }

    window.addEventListener("message", receiveMessage);
  }

  // Checks if the user is authenticated
  function isAuthenticated(callback) {
    getToken(function (token) {
      console.log("User authenticated:", !!token);
      callback(!!token);
    });
  }

  // Decodes a JWT token
  function decodeToken(token) {
    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      console.log("Token decoded:", decoded);
      return decoded;
    } catch (error) {
      console.error("Invalid token:", error);
      return null;
    }
  }

  // Retrieves user information from the token
  function getUserInfo(callback) {
    getToken(function (token) {
      if (!token) {
        console.log("No token found.");
        callback(null);
      } else {
        const userInfo = decodeToken(token);
        console.log("User info retrieved:", userInfo);
        callback(userInfo);
      }
    });
  }

  // Expose the SDK functions
  window.TrustedAgeSdk = {
    isAuthenticated,
    getUserInfo,
    getToken,
  };
})(window);
