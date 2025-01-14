// function wrapAsunc(fn){
//     return function(req,res,next){
//         fn(req,res,next).catch(next);
//     }
// }

//To avoid try and catch each time
module.exports=(fn)=>{
    return function(req,res,next){
        fn(req,res,next).catch(next);
    }
}