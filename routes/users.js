const express = require('express');
const router = express.Router();
const passport = require('passport');

const usersController = require('../controllers/users_controller');


router.get('/profile/:id', passport.checkAuthentication,usersController.profile);
router.post('/update-profile-info/:id', passport.checkAuthentication,usersController.updateProfile);
router.get("/change-email",passport.checkAuthentication,usersController.changeEmailMessage);
router.get("/reset-email",passport.checkAuthentication,usersController.changeEmailPage);
router.post("/reset-email-confirm/:id",passport.checkAuthentication,usersController.changeEmailConfirm);
router.get("/remove-dp",passport.checkAuthentication,usersController.removeDP);

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

router.post("/workgrad/add",passport.checkAuthentication,usersController.addWorkGrad)
router.get("/workgrad/update-modal",passport.checkAuthentication,usersController.updateWorkGradModal)
router.post("/workgrad/update-work-grad",passport.checkAuthentication,usersController.updateWorkGrad)
router.get("/workgrad/delete-modal",passport.checkAuthentication,usersController.deleteWorkGradModal)
router.get("/workgrad/delete-work-grad",passport.checkAuthentication,usersController.deleteWorkGrad)



module.exports = router;