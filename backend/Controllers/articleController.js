const articleModel = require('../Models/articleModel');
const ErrorHandler = require("../utils/errorHandler");

module.exports.createArticle = async(req,res,next)=>{
    let {title, description, articleImage} = req.body;
    try {
        await articleModel.create({
            title,
            description,
            articleImage,
            createdBy: req.user.id,
        });
        res.status(200).json({
            success:true,
            message:"Article created successfully!",
        })
    } catch (error) {
        if(error.errors.title === undefined){
            return next(new ErrorHandler(302,`Please upload atleast an image!`));
        }
            return next(new ErrorHandler(302,`${error.errors.title || error.errors.description}`));
        }
}

module.exports.getArticles = async(req,res,next)=>{
    let article = await articleModel.find();
    if(!article.length){
        return next(new ErrorHandler(404,"Article not available!"));
    }
    res.status(200).json({
        success:true,
        article,
    })
}

