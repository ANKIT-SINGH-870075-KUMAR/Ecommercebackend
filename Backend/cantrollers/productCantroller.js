const cloudinary = require("cloudinary");
const Product = require('../models/Product');
const ApiFeatures = require('../Utils/apifeatures');
const ErrorHandler = require('../Utils/errorHandler');
const catchAsyncError = require('../middleWare/catchAsyncError');

//Create Product -- Admin
exports.createProduct = catchAsyncError(async (req, res, next) => {

    let images = [];
    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    }
    else {
        images = req.body.images;
    }

    const imagesLink = [];

    for (let i = 0; i < images.length; i++) {

        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: "products"
        });

        imagesLink.push({
            public_id: result.public_id,
            url: result.secure_url
        });
    }

    req.body.images = imagesLink;

    //show user id after creating product
    req.body.user = req.user.id

    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
});

// Get All Product 
exports.fetchAllProducts = catchAsyncError(async (req, res, next) => {

    /*
    1.resultperpage-> result in one page
    2.countDocument method  use for counting product 
    */
    const resultPerPage = 8;
    const productCount = await Product.countDocuments();
    const apifetaures = new ApiFeatures(Product.find(), req.query).search().filter().pagination(resultPerPage);

    const products = await apifetaures.query;
    res.status(200).json({ success: true, products, productCount, resultPerPage });

});

// Get All Product (Admin)
exports.getAdminProducts = catchAsyncError(async (req, res, next) => {
    const products = await Product.find();

    res.status(200).json({
        success: true,
        products,
    });
});

//update product-Admin
exports.updateProduct = catchAsyncError(async (req, res, next) => {

    let product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    //Images Start Here

    let images = [];
    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    }
    else {
        images = req.body.images;
    }

    if (images !== undefined) {
        //Deleting Images From Cloudinary
        for (let i = 0; i < product.images.length; i++) {
            await cloudinary.v2.uploader.destroy(product.images[i].public_id);

        }

        const imagesLink = [];

        for (let i = 0; i < images.length; i++) {

            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: "products"
            });

            imagesLink.push({
                public_id: result.public_id,
                url: result.secure_url
            });
        }

        req.body.images = imagesLink;
    }



    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true, useFindAndModify: false })
    res.status(200).json({ success: true, product });
});

//delete product--Admin
exports.deleteProduct = catchAsyncError(async (req, res, next) => {

    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    //Deleting Images From Cloudinary
    for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);

    }

    await product.remove();
    res.status(200).json({ success: true, message: "Product Delete Successfully" });
});

//product details
exports.detailProduct = catchAsyncError(async (req, res, next) => {

    const product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }
    res.status(200).json({ success: true, product });
});

//create New Review or update the review
exports.createProductReview = catchAsyncError(async (req, res, next) => {

    /*
    1. use destructing for ration ,comment , productid
    2. create a object(review)
    3. find product id for review particular product
    4. use if else statement ,if statement use for check user id already exist or not and then (isReviewed)--->return boolean(true or false) but else statement use for new review of a particular product 
    5. calculate overall rating using average
    */

    const { rating, comment, productId } = req.body
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment: comment,
    };

    const product = await Product.findById(productId);
    const isReviewed = product.reviews.find(rev => rev.user.toString() === req.user._id.toString());

    if (isReviewed) {
        product.reviews.forEach((rev => {
            if (rev.user.toString() === req.user._id.toString()) {
                rev.rating = rating,
                    rev.comment = comment
            }
        }))
    }
    else {
        product.reviews.push(review);
        product.number_of_reviews = product.reviews.length
    }

    let avg = 0;
    product.reviews.forEach(rev => {
        avg += rev.rating
    })
    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });
    res.status(200).json({ success: true, });
});

//Get All Reviews of a single Product 
exports.getProductReviews = catchAsyncError(async (req, res, next) => {

    // use product id as a parmeter to get all review for a single product
    const product = await Product.findById(req.query.id);
    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }
    res.status(200).json({ success: true, reviews: product.reviews });
});

//Delete Review 
exports.deleteReview = catchAsyncError(async (req, res, next) => {

    /*
    1. use product id and review id as a parameter to delete a review for a particular product 
    */
    const product = await Product.findById(req.query.productId);
    if (!product) {
        return next(new ErrorHandler("Product not found", 404));
    }
    const reviews = product.reviews.filter(rev => rev._id.toString() !== req.query.id.toString());

    let avg = 0;
    reviews.forEach(rev => {
        avg += rev.rating
    })

    let ratings = 0;
    if (reviews.length === 0) {
        ratings = 0
    }
    else {

        ratings = avg / reviews.length;
    }

    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews, ratings, numOfReviews
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });

    res.status(200).json({ success: true, });
});