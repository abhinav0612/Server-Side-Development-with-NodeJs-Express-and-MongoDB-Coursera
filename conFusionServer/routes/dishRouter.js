const express = require('express');
const bodyParser = require('body-parser');
const dishRouter = express.Router();
const authenticate = require('../authenticate');
const Dishes = require('../models/dishes');

dishRouter.use(bodyParser.json());

//for /dishes
dishRouter.route('/')
.get( (req,res,next)=>{
    Dishes.find({})
    .populate('comments.author')
    .then((dish)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type',"application/json");
        res.json(dish);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next)=>{
    res.statusCode = 403;
    res.end('Invalid request : Can not perform PUT on /dishes');
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next)=>{
    Dishes.create(req.body)
    .then((dish)=>{
        console.log('Dish created',dish);
        res.statusCode = 200;
        res.setHeader('Content-Type',"text/json");
        res.json(dish);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next)=>{
    Dishes.remove({})
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type',"application/json");
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err));
});

//for /dishes/:dihsId

dishRouter.route('/:dishId')
.get((req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type',"application/json");
        res.json(dish);  
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next)=>{
    Dishes.findByIdAndUpdate(req.params.dishId,{$set : req.body},{new:true})
    .then((dish)=>{
        res.statusCode = 200;
        res.setHeader('Content-Type',"application/json");
        res.json(dish);  
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next)=>{
    res.statusCode = 403;
    res.end('Invalid request : Can not perform POST on /dishes/'+req.params.dishId);
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next)=>{
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((dish)=>{
        res.statuscode = 200;
        res.setHeader('Content-Type',"application/json");
        res.json(dish);  
    },(err)=>next(err))
    .catch((err)=>next(err));
});

//for /dishes/comments

dishRouter.route('/:dishId/comments')
.get((req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish)=>{
        if(dish!=null){
            res.statusCode = 200;
            res.setHeader('Content-Type',"application/json");
            res.json(dish.comments);  
        }
        else{
            err = new Error('Dish '+req.params.dishId+' not exist.');
            err.status = 404;
            return next(err);
        }
 
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.put(authenticate.verifyUser, (req,res,next)=>{
    res.statusCode = 403;
    res.end('Invalid request : Can not perform PUT on /dishes/comments');
})
.post(authenticate.verifyUser, (req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .then((dish)=>{
        if(dish!=null){
            req.body.author = req.user._id;
            dish.comments.push(req.body);
            dish.save()
            .then((dish)=>{
                res.statusCode = 200;
                 res.setHeader('Content-Type',"application/json");
                 res.json(dish); 
            },(err)=>next(err))
            .catch((err)=>next(err));
        }
        else{
            err = new Error('Dish '+req.params.dishId+' not exist.');
            err.status = 404;
            return next(err);
        }
 
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .then((dish)=>{
        if(dish!=null){
          for(var i = dish.comments.length-1;i>=0;i--){
              dish.comments.id(dish.comments[i]._id).remove();
          }  
          dish.save()
          .then((resp)=>{
            res.statusCode = 200;
            res.setHeader('Content-Type',"application/json");
            res.json(resp); 
          },(err)=>next(err))
          .catch((err)=>next(err));
        }
        else{
            err = new Error('Dish '+req.params.dishId+' not exist.');
            err.status = 404;
            return next(err);
        }

        },(err)=>next(err))
    .catch((err)=>next(err));
});

//for /dishes/comments/commentId

dishRouter.route('/:dishId/comments/:commentId')
.get((req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish)=>{
        if(dish!=null && dish.comments.id(req.params.commentId)!= null){
            res.statusCode = 200;
            res.setHeader('Content-Type',"application/json");
            res.json(dish.comments.id(req.params.commentId));    
        }
        else if(dish==null){
            err = new Error('Dish '+req.params.dishId+' not exist.');
            err.status = 404;
            return next(err);
        }
        else{
            err = new Error('Comment '+req.params.commentId+' not exist.');
            err.status = 404;
            return next(err); 
        }
 
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.put(authenticate.verifyUser, (req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .then((dish)=>{
        if(dish!=null && dish.comments.id(req.params.commentId)!= null){
            console.log('User',req.user);
            console.log('Comment',dish.comments.id(req.params.commentId));
            if(req.user._id.equals(dish.comments.id(req.params.commentId).author)){
                if(req.body.rating){
                    dish.comments.id(req.params.commentId).rating = req.body.rating;
                }
                if(req.body.comment){
                    dish.comments.id(req.params.commentId).comment = req.body.comment;
                }
                dish.save()
                .then((dish)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type',"application/json");
                    res.json(dish);
                },(err)=>next(err))
                .catch((err)=>next(err));
            }
            else{
                var err = new Error('You can only update comments posted by you.');
                err.status = 401;
                return next(err);
            }  
        }
        else if(dish==null){
            err = new Error('Dish '+req.params.dishId+' not exist.');
            err.status = 404;
            return next(err);
        }
        else{
            err = new Error('Comment '+req.params.commentId+' not exist.');
            err.status = 404;
            return next(err); 
        }
 
    },(err)=>next(err))
    .catch((err)=>next(err)); 

})
.post(authenticate.verifyUser, (req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .then((dish)=>{
        if(dish!=null){
            res.end('Invalid request : Can not perform POST on /dishes/comments/'+ req.params.commentId);
        }
        else{
            err = new Error('Dish '+req.params.dishId+' not exist.');
            err.status = 404;
            return next(err);
        }
 
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.delete(authenticate.verifyUser, (req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .then((dish)=>{
        
        if(dish!=null && dish.comments.id(req.params.commentId)!= null){
            if(req.user._id.equals(dish.comments.id(req.params.commentId).author)){
                dish.comments.id(req.params.commentId).remove();
                dish.save()
                .then((resp)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(resp);
                },(err)=>next(err))
                .catch((err)=>next(err));
            }
            else{
                var err = new Error('You can only delete comments posted by you.');
                err.status = 401;
                return next(err);
            }
            
        }
        else if(dish==null){
            err = new Error('Dish '+req.params.dishId+' not exist.');
            err.status = 404;
            return next(err);
        }
        else{
            err = new Error('Comment '+req.params.commentId+' not exist.');
            err.status = 404;
            return next(err); 
        }
 
    },(err)=>next(err))
    .catch((err)=>next(err));
});


module.exports = dishRouter;