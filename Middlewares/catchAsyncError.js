module.exports.catchAsyncError = (functionPassed) => (req,res,next) =>{
    Promise.resolve(functionPassed(req,res,next)).catch(next);
}