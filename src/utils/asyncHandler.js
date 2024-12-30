const asyncHandler = (requesthandler)=>{
  return (req,res,next)=>{

        Promise.resolve(requesthandler(req,res,next))
        .catch((err)=>next(err));
    }
}

export default asyncHandler;
//a wrapper function for error handling 



// const asynchandler = (funct)=>{ async (req,res,next)=>{

//     try{
//         await funct(req,res,next);
//     }
//     catch(err){
//         res.status(err.code||500).json({
//             success:false,
//             message:err.message 
//         })
        
//     }
// } }