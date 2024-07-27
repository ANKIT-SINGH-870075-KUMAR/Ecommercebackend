/* 
1.error is a default class of nodejs 
2.errorhandler inherit by error class 
3.use constructor and super keywords 
4.use error class methods :- captureStackTrace
*/ 
class ErrorHandler extends Error{
    constructor(message, statuscode){
      super(message);
      this.statuscode = statuscode
      Error.captureStackTrace(this,this.constructor);
    }
}

module.exports = ErrorHandler;