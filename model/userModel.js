const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is Required'],
    },
    pseudo: {
      type: String,
      required: [true, 'Pseudo name is Required'],
    },
    usNumber: {
      type: String,
    },
    pkNumber: {
      type: String,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      // validate: [
      //   {
      //     validator: function (value) {
      //       return value.endsWith('@inviztechnologies.net');
      //     },
      //     message: 'Invalid Email',
      //   },
      // ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password should be atleast 6 characters '],
    },
    emailVerified: {
      type: Boolean,
      default: true,
    },
    isResetPassword: {
      type: Boolean,
      default: false,
    },
    // role: {
    //   type: String,
    //   enum: ['user', 'admin'],
    //   default: 'user',
    // },
    role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
    merchants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Merchant',
      },
    ],
    active: {
      type: Boolean,
      default: false,
    },
    businessUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusinessUnit',
    },
    isHead: {
      type: Boolean,
      default: false,
    },

    brands: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Brand',
    },
    userImage: {
      type: String,
      default:
        'https://res.cloudinary.com/dpn63nsxi/image/upload/v1679904354/Invoice_client_images/user_profile_bxcqla.png',
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    pay_arc_customer_id: String,
  },
  { timestamps: true },
);

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

userSchema.virtual('leads', {
  ref: 'Leads',
  localField: '_id',
  foreignField: 'assignedTo',
});

userSchema.statics.signup = async function (
  name,
  pseudo,
  usNumber,
  pkNumber,
  email,
  password,
  role,
  userImage,
) {
  if (!name) {
    throw Error('The name is required');
  }
  if (!pseudo) {
    throw Error('The pseudo is required');
  }
  if (!usNumber) {
    throw Error('Us Number is required');
  }
  if (!pkNumber) {
    throw Error('PK Numberis required');
  }
  if (!email) {
    throw Error('Email is required');
  }
  if (!password) {
    throw Error('Password is required');
  }
  if (!validator.isEmail(email)) {
    throw Error('Invalid Email!');
  }

  const exist = await this.findOne({ email });

  if (exist) {
    throw Error('Email is already in use by another account');
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const user = await this.create({
    name,
    pseudo,
    usNumber,
    pkNumber,
    email,
    role,
    userImage,
    password: hash,
  });

  return user;
};

userSchema.statics.login = async function (email, password) {
  if (!email || !password) {
    throw Error('Invalid Credentials');
  }

  const _user = await this.findOne({ email })
    .select('name psuedo role email emailVerified userImage password active')
    .populate('role')
    .populate({
      path: 'role',
      populate: { path: 'modulePermissions.module' },
    })
    .exec();

  if (!_user) {
    throw Error('There is no user corresponding to this email');
  }
  if (!_user.emailVerified) {
    throw Error('Email not verified! Please check your email to verify.');
  }
  if (!_user.active) {
    throw Error('Account not approved yet.');
  }

  const passwordOk = await bcrypt.compare(password, _user.password);
  if (!passwordOk) {
    throw Error('Incorrect Email or Password');
  }

  const userWithoutSensitiveInfo = _user.toObject();
  delete userWithoutSensitiveInfo.password;
  delete userWithoutSensitiveInfo.active;

  return userWithoutSensitiveInfo;
};

module.exports = mongoose.model('User', userSchema);
