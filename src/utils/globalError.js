import { deleteFile } from "./fileUpload/file-functions.js";

export const globalError = (err , req, res ,next)=>{
    let code = err.statusCode || 500 
    if(req.file){
        deleteFile(req.file.path)
    }
    res.status(code).json({ 
        error: "Error: ", 
        message: err.message , 
        code ,
        sucess: false, 
        stack: err.stack});
};