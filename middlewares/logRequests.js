const logRequests = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
    if (req.method === "POST" || req.method === "PUT") {
      console.log("Request Body:", req.body);
    }
  
    // Intercept the response body
    const originalJson = res.json; // Save original `res.json` method
    res.json = function (data) {
      console.log("Response Data:", data); // Log the response body
      originalJson.call(this, data); // Call the original `res.json` method
    };
  
    next();
  };
  export default logRequests;
  