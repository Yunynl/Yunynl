const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const SALT_WORK_FACTOR = 10;

// Schema for users
const User = mongoose.Schema(
  {
    email: String,
    password: String,
  },
  { collection: "User" }
);


User.pre('save', function(next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);

    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);
      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

User.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

User.options.toJSON = {
  transform: function(doc, ret, options) {
    delete ret.__v;
    delete ret.password;
    return ret;
  }
};

module.exports = mongoose.model("User", User);
