let {mongooose} = require('../../db/mongoose');

let Location = mongooose.model('Location',{
    name: {
        required:true,
        type:String,
        trim:true,
        minLength:1
    },
     description:{
        required:true,
        type:String,
        trim:true,
        minLength:1
     },
    
    creator:{
        required:true,
        type:mongooose.Schema.Types.ObjectId
    },
     
    createdAt: {
         type:Number,
         default: new Date().getTime()
     }

})


module.exports = {Location};
//name,description,createdAt