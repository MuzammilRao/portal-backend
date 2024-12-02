const User = require('../model/userModel');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const cloudinary = require('../utils/cloudinary');
const bcrypt = require('bcrypt');
const AppError = require('../utils/appError');
const CatchAsync = require('../utils/CatchAsync');
const { config } = require('../config');
const Invitation = require('../model/invitationModel');
const { logAction } = require('../utils/Logging');
const { LOG_ACTIONS } = require('../constants');

exports.signupUser = CatchAsync(async (req, res, next) => {
  const inviteToken = req.params.token;
  const { name, pseudo, usNumber, pkNumber, email, password, userImage } = req.body;

  const invitation = await Invitation.findOne({ email });
  if (!invitation) {
    return next(new AppError('No Invitation found', 401));
  }

  const allowed = await bcrypt.compare(inviteToken, invitation.token);
  if (!allowed) {
    return next(new AppError('Unauthorized', 401));
  }

  const user = await User.signup(name, pseudo, usNumber, pkNumber, email, password, userImage);
  if (!user) {
    return next(new AppError('User Not Created', 400));
  }

  // const token = createToken(user._id);

  // const verificationLink = `${req.protocol}://${req.get('host')}/api/v1/users/verify/${token}`;
  // sendEmail(user.email, verificationLink);

  await logAction(
    user._id,
    LOG_ACTIONS.CREATE,
    'User',
    user._id,
    {
      name: { from: null, to: name },
      email: { from: null, to: email },
    },
    `${name} (email: ${email}) signed up.`,
  );

  return res.status(201).json({
    status: 'success',
    message: 'Account Created Successfully!. ',
  });
});

exports.emailVerifiaction = CatchAsync(async (req, res, next) => {
  const { token } = req.params;
  const isEmailVerified = jwt.verify(token, config.SECRET);
  if (!isEmailVerified) {
    return next(new AppError('Invalid Link', 400));
  }
  const verifiedUser = await User.findByIdAndUpdate(isEmailVerified._id, {
    $set: {
      emailVerified: true,
    },
  });

  if (!verifiedUser) {
    return next(new AppError('Link Expired', 400));
  }
  await logAction(
    verifiedUser._id,
    LOG_ACTIONS.APPROVE,
    'User Verification',
    verifiedUser._id,
    {
      emailVerified: { from: false, to: true },
    },
    `User ${verifiedUser.name} (email: ${verifiedUser.email}) verified their email.`,
  );

  return res.status(200).json({
    message: 'Email Verified!',
  });
});

exports.loginUser = CatchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Invalid Credentials', 400));
  }

  const user = await User.findOne({ email })
    .select('name psuedo role email emailVerified userImage password active')
    .populate('role')
    .populate({
      path: 'role',
      populate: { path: 'modulePermissions.module' },
    })
    .exec();

  // console.log('useremail', email);
  // console.log('user', user);

  if (!user) {
    return next(new AppError('There is no user corresponding to this email', 400));
  }

  if (!user.active) {
    return next(new AppError('Account not approved yet.', 400));
  }

  const passwordOk = await bcrypt.compare(password, user.password);
  if (!passwordOk) {
    return next(new AppError('Incorrect Email or Password', 400));
  }

  const token = createToken(user._id);
  if (!user) {
    return next(new AppError('Login Error', 400));
  }

  let _user = {
    _id: user._id,
    name: user.name,
    pseudo: user.pseudo,
    role: user?.role?.name,
    email: user.email,
    emailVerified: user.emailVerified,
    token: token,
    userImage: user.userImage,
    token: token,
    roles: user.role,
  };

  await logAction(
    user._id,
    LOG_ACTIONS.LOGIN,
    'User',
    null,
    {},
    `User ${user.name} (email: ${email}) logged in.`,
  );

  return res.status(200).json({
    status: 'success',
    message: 'Login Sucessfully',
    data: _user,
  });
});

exports.updateUsers = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new AppError(`Invalid Id! No data coressponding to this id  ${id}`, 400));
  }
  const { firstName, lastName, email, userImage } = req.body;

  if (userImage) {
    const uploadRes = await cloudinary.uploader.upload(userImage, {
      upload_preset: 'Invoice_client_images',
    });

    const updateData = {
      firstName,
      lastName,
      email,
      userImage: uploadRes.url,
    };
    if (uploadRes) {
      const updatedUsers = await User.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      const token = createToken(updatedUsers._id);

      const jsonUser = {
        _id: updatedUsers._id,
        firstName: updatedUsers.firstName,
        lastName: updatedUsers.lastName,
        email: updatedUsers.email,
        role: updatedUsers.role,
        emailVerified: updatedUsers.emailVerified,
        token: token,
        userImage: updatedUsers.userImage,
      };

      if (updatedUsers) {
        return res.status(200).json({ status: 'success', data: jsonUser });
      }
    }
  }
});

exports.forgotPassword = CatchAsync(async (req, res, next) => {
  const { email } = req.body;

  const userExist = await User.findOne({ email });

  if (!userExist) {
    return next(new AppError('User Not found', 400));
  }

  const link = `http://localhost:3000/api/v1/users/reset-password/${userExist._id}`;

  sendEmail(userExist.email, link);

  return res.status(201).json({
    status: 'success',
    message: 'Reset password link has been sent to your email',
    user: userExist,
  });
});

exports.inboxEmail = CatchAsync(async (req, res, next) => {
  const { email } = req.body;

  const userExist = await User.findOne({ email });

  if (!userExist) {
    return next(new AppError('User Not found', 400));
  }

  return res.status(201).json({
    status: 'success',
    user: userExist,
  });
});

exports.resetPassword = CatchAsync(async (req, res, next) => {
  const { id, token } = req.params;
  const userExist = await User.findOne({ _id: id });
  if (!userExist) {
    return next(new AppError('User Not found', 400));
  }

  const secret = config.SECRET + userExist.password;
  const payload = await jwt.verify(token, secret);
  return res.status(200).json({
    status: 'success',
    email: userExist.email,
  });
});

exports.resetPasswordUpdate = CatchAsync(async (req, res, next) => {
  const { id } = req.params;

  const userExist = await User.findOne({ _id: id });
  if (!userExist) {
    return next(new AppError('User Not found', 400));
  }

  const secret = config.SECRET + userExist.password;

  const { password, password2 } = req.body;

  let salt;
  let hash;

  if (password !== password2) {
    return next(new AppError('Password do not match!', 400));
  }

  salt = await bcrypt.genSalt(10);
  hash = await bcrypt.hash(password, salt);

  const verifiedUser = await User.findByIdAndUpdate(
    { _id: id },
    {
      $set: {
        password: hash,
        isResetPassword: true,
      },
    },
  );

  if (!verifiedUser) {
    return next(new AppError('Sorry! Password not updated!', 500));
  }

  return res.status(201).json({
    status: 'success',
    message: 'Your Password has been Updated',
  });
});

const createToken = (_id) => {
  return jwt.sign({ _id }, config.SECRET, { expiresIn: '6h' });
};

// exports.signupUser = async (req, res) => {
//   const { name, pseudo, usNumber, pkNumber, email, password, userImage } = req.body;
//   const inviteToken = req.params.token;
//   try {
//     const invitation = await Invitation.findOne({ email });

//     const allowed = await bcrypt.compare(inviteToken, invitation.token);

//     if (!allowed) {
//       return res.status(400).json({
//         status: 'failed',
//         error: 'Unauthorized',
//       });
//     }

//     const user = await User.signup(name, pseudo, usNumber, pkNumber, email, password, userImage);
//     const token = createToken(user._id);
//     const jsonUser = {
//       _id: user._id,
//       name: user.name,
//       pseudo: user.pseudo,
//       usNumber: user.usNumber,
//       pkNumber: user.pkNumber,
//       email: user.email,
//       role: user.role,
//       emailVerified: user.emailVerified,
//       token: token,
//       userImage,
//     };
//     const verificationLink = `${req.protocol}://${req.get('host')}/api/v1/users/verify/${token}`;
//     if (user) {
//       sendEmail(user.email, verificationLink);
//     }
//     user &&
//       res.status(201).json({
//         status: 'success',
//         message:
//           'Account Created Successfully! Now Admin will approve email verification to continue login.',
//         data: jsonUser,
//       });
//   } catch (error) {
//     return res.status(400).json({
//       status: 'failed',
//       error: error.message,
//     });
//   }
// };

// exports.emailVerifiaction = async (req, res) => {
//   const { token } = req.params;

//   try {
//     if (token) {
//       const isEmailVerified = jwt.verify(token, config.SECRET);
//       if (isEmailVerified) {
//         const verifiedUser = await User.findByIdAndUpdate(isEmailVerified._id, {
//           $set: {
//             emailVerified: true,
//           },
//         });
//         if (verifiedUser) {
//           return res.status(200).json({
//             message: 'Email verified Successfully!',
//           });
//         }
//       } else {
//         throw Error('Link Expired!');
//       }
//     } else {
//       throw Error('Invalid Link!');
//     }
//   } catch (error) {
//     return res.status(400).json({
//       status: 'failed',
//       error: error.message,
//     });
//   }
// };

// exports.loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.login(email, password);
//     const token = createToken(user._id);

//     const jsonUser = {
//       _id: user._id,
//       name: user.name,
//       pseudo: user.pseudo,
//       role: user.role,
//       email: user.email,
//       emailVerified: user.emailVerified,
//       token: token,
//       userImage: user.userImage,
//     };

//     if (!user.emailVerified) {
//       throw Error('Email not verified! Please check your email to verify.');
//     } else if (!user.active) {
//       throw Error('Account not approved yet.');
//     } else {
//       return res.status(201).json({
//         status: 'success',
//         message: 'Login Sucessfully',
//         data: jsonUser,
//       });
//     }
//   } catch (error) {
//     return res.status(400).json({
//       status: 'failed',
//       error: error.message,
//     });
//   }
// };
