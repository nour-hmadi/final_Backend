const errorHandler = (err, req, res, next) => {
  console.error(`❌ Error: ${err.message}`.red);

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode ;
    res.status(statusCode);
  
    res.json({
      success: false,
      message: err.message || "Server Error",
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
  };


  export default errorHandler;
  