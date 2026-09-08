const jwt=require('jsonwebtoken');

module.exports=(req,res,next)=>{
  const token= req.header('Authorization')?.replace('Bearer ','');

  if(!token)return res.status(401).json({message:"Access denied. No Token is being provided"})

    try{
      const decoded =jwt.verify(token,process.env.JWT_SECRET);

    req.user = {
      id: decoded.id || decoded._id,
      _id: decoded.id || decoded._id
    };
      next();
    }
    catch(err){
      res.status(400).json({message:"Invalid Token"});
    }
}