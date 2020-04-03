const express = require('express');
const bodyParser = require('body-parser');
const leaderRouter = express.Router();
const authenticate = require('../authenticate');
const Leaders = require('../models/leaders');


leaderRouter.use(bodyParser.json());

//for /leaders
leaderRouter.route('/')
.get((req,res,next)=>{
    Leaders.find({})
    .then((leader)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type',"application/json");
        res.json(leader);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.put(authenticate.verifyUser, (req,res,next)=>{
    res.statusCode = 403;
    res.end('Invalid request : Can not perform PUT on /leaders');
})
.post(authenticate.verifyUser, (req,res,next)=>{
    Leaders.create(req.body)
    .then((leader)=>{
        console.log('Leader created',leader);
        res.statusCode = 200;
        res.setHeader('Content-Type',"text/json");
        res.json(leader);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.delete(authenticate.verifyUser, (req,res,next)=>{
    Leaders.remove({})
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type',"application/json");
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err));
});

//for /leaders/:leaderId

leaderRouter.route('/:leaderId')
.get((req,res,next)=>{
    Leaders.findById(req.params.leaderId)
    .then((leader)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type',"application/json");
        res.json(leader);  
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.put(authenticate.verifyUser, (req,res,next)=>{
    Leaders.findByIdAndUpdate(req.params.leaderId,{$set : req.body},{new:true})
    .then((leader)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type',"application/json");
        res.json(leader);  
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post(authenticate.verifyUser, (req,res,next)=>{
    res.statusCode = 403;
    res.end('Invalid request : Can not perform POST on /leaders/'+req.params.leaderId);
})
.delete(authenticate.verifyUser, (req,res,next)=>{
    Leaders.findByIdAndRemove(req.params.leaderId)
    .then((leader)=>{
        res.statuscode = 200;
        res.setHeader('Content-Type',"application/json");
        res.json(leader);  
    },(err)=>next(err))
    .catch((err)=>next(err));
});

module.exports = leaderRouter;