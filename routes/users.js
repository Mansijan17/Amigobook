const express = require('express');
const router = express.Router();
const passport = require('passport');

const usersController = require('../controllers/users_controller');


router.get('/profile/:id', passport.checkAuthentication,usersController.profile);
router.post('/update/:id', passport.checkAuthentication,usersController.update);

router.get('/sign-up', usersController.signUp);
router.get('/sign-in', usersController.signIn);


router.post('/create', usersController.create);

// use passport as a middleware to authenticate
router.post('/create-session', passport.authenticate(
    'local',
    {failureRedirect: '/users/sign-in'},
), usersController.createSession);
router.get("/sign-out",usersController.destroySession);

router.get("/auth/google",passport.authenticate('google',{scope:['profile','email']}));
router.get("/auth/google/callback",passport.authenticate('google',{failureRedirect:"/users/sign-in"}),usersController.createSession);

router.get("/forget-password",usersController.forgetPassword);
router.post("/reset-password",usersController.resetPasswordEmailLink);
router.get("/resetting-password/:id",usersController.newPassword);
router.post("/resetting-password/:id",usersController.resetPassword);

router.get("/friends-pending-form",passport.checkAuthentication,usersController.sendFriendshipForms);
router.get("/friends-cancel-form",passport.checkAuthentication,usersController.destroyFriendshipForms);
router.get("/make-friends",passport.checkAuthentication,usersController.makeFriendShip);
router.get("/destroy-friends/:loggedUserPage",passport.checkAuthentication,usersController.destroyFriendship);

router.get("/newaccount/:id",usersController.confirmAccount);
router.post("/newaccount/:id",usersController.verifyAccount);

router.post("/add-work",passport.checkAuthentication,usersController.addWork)
router.get("/update-work-modal",passport.checkAuthentication,usersController.updateWorkModal)
router.post("/update-work",passport.checkAuthentication,usersController.updateWork)

module.exports = router;