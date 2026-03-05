import https from "https";
import http from "http";

export default async function isUrlActive(urlString) {
  return new Promise((resolve) => {
    // Determine which module to use based on the protocol
    const client = urlString.startsWith("https") ? https : http;
    const options = {
      method: "HEAD", // Use HEAD method to avoid downloading the body
      timeout: 5000, // Optional: set a timeout in milliseconds
    };

    const req = client.request(urlString, options, (res) => {
      // Check for successful status codes (e.g., 200 OK, 301 Redirect)
      const isActive = res.statusCode >= 200 && res.statusCode < 400;
      resolve(isActive);
    });

    req.on("error", (e) => {
      // Handle network errors (e.g., DNS issues, connection refused)
      console.error(`Error checking URL ${urlString}: ${e.message}`);
      resolve(false);
    });

    // Handle timeout errors
    req.on("timeout", () => {
      req.destroy();
      console.error(`Timeout checking URL ${urlString}`);
      resolve(false);
    });

    req.end();
  });
}
