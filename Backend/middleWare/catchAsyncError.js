/*
 1. use normal arrow function 
 2. use promise class prebuild in java
 3. resolve and reject function as a try catch block
 */
 const catchAsyncError = theFunc => (req, res, next) => {
    Promise.resolve(theFunc(req, res, next)).catch(next);
};

export default catchAsyncError;
