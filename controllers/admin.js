const product = require('../models/product');
const Product = require('../models/product');
const fileHelper = require('../util/file');
const {validationResult} = require('express-validator');
const ITEMS_PER_PAGE = 2;
exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    errorMessage: null,
    editing: false,
    validationErrors:[]
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image= req.file;
  console.log(image);
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req);
  if(!image){
     return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      errorMessage: 'Invalid file type',
      editing: false,
      product: {
        title: req.body.title,
        price :req.body.price,
        description : req.body.description,
        _id: req.user._id
      },
      validationErrors: []
    });
  }
  if(!errors.isEmpty()){
    console.log("error is found");
    return res.render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      errorMessage: errors.array()[0].msg,
      editing: false,
      product: {
        title: req.body.title,
        price :req.body.price,
        description : req.body.description,
        _id: req.user._id
      },
      validationErrors: errors.array()
    });
      
  }
  const imageUrl = image.path;
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user,
  });
  product
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Product');
      res.redirect('/');
    })
    .catch(err => {
      res.redirect('/500');
      //console.log(err);
    });
  
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        errorMessage:null
      });
    })
    .catch(err => res.redirect('/500'));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const image = req.file;
  const updatedDesc = req.body.description;
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      errorMessage: errors.array()[0].msg,
      editing: true,
      product: {
        title: req.body.title,
        price :req.body.price,
        description : req.body.description,
        _id: prodId
      },
      validationErrors: errors.array()
    });
  }

  Product.findById(prodId)
    .then(product => {
      if(product.userId.toString() !== req.user._id.toString()){
        return res.redirect('/');
      }
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      if(image){
        fileHelper.deleteFile(product.imageUrl);
        product.imageUrl = image.path;
      }
      
      return product.save()
      .then(result => {
        console.log('UPDATED PRODUCT!');
        res.redirect('/admin/products');
      })
    })
    .catch((err)=>{
      console.log(err);
      res.redirect('/500');
    })
};

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;
  Product.find().countDocuments().then(numberProducts=>{
    totalItems = numberProducts;
    return Product.find()
    .skip((page - 1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
  })
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then(products => {
      //console.log(products);
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page>1,
        nextPage: page+1,
        PreviousPage: page -1,
        lastPage:Math.ceil(totalItems/ITEMS_PER_PAGE)
      });
    })
    .catch(err => res.redirect('/500'));
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId).then((product )=>{
    if(!product){
      res.redirect('/500');
    }
    fileHelper.deleteFile(product.imageUrl)
   // return Product.deleteOne({_id:prodId,userId:req.user._id})
  })
  //Product.findByIdAndRemove(prodId)
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.status(200).json({
        message:"success!"
      });
    })
    .catch(err => res.status(500).json({message:"Deleting product failed."}));
};
