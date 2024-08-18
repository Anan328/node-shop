const express = require('express');
//const {check} = require('express-validator/check');
const { check} = require('express-validator');


const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', 
    check('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
check('password').isLength({min:5}).isAlphanumeric()
.trim(),
authController.postLogin);

router.
post('/signup',
     check('email')
     .isEmail()
     .withMessage('Please enter a valid email')
     .custom((value,{req})=>{
        if(value ==='test@test.com'){
            throw new Error('This email address is forbidden');
        }
        return true;
     })
     .normalizeEmail(),
     check('password',"check password").isLength({min:5}).isAlphanumeric().trim(),
     check('confirmPassword').custom((value,{req})=>{
        if(value !== req.body.password){
            throw new Error('Password have to match!');
        }
        return true;
     }).trim(),
     authController.postSignup);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;