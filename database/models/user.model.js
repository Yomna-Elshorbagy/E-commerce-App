import mongoose, { Schema } from "mongoose";
import { roles, status } from "../../src/utils/constant/enums.js";
import { hashedPass } from "../../src/utils/hash-compare.js";

let userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "last name must be at least 3 characters long"],
      maxlength: [70, "last name cannot exceed 70 characters"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    password: {
      type: String,
      required: true,
    },
    recoveryEmail: {
      type: String,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    },
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: /^01[01245]\d{8}$/,
        message: (props) => `${props.value} is not a valid mobile number!`,
      },
    },
    role: {
      type: String,
      enum: Object.values(roles),
      default: roles.USER,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: Object.values(status),
      default: status.PENDING,
    },
    image: {
      type: Object,
      default: {
        secure_url: process.env.SECURE_URL,
        public_id: process.env.PUBLIC_ID,
      },
    }, //{secure_url, public_id}
    address: [
      {
        street: String,
        city: String,
        phone: String,
      },
    ],
    DOB: Date,
    otpCode: String,
    otpExpire: Date,
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    passwordChangedAt: Date,
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//midelware hooks:
// userSchema.pre('save', async function(next){
//   if (!this.isModified('password')) return next();
//   this.password = hashedPass({password: this.password})
//   next()
// });

// userSchema.pre('findOneAndUpdate', async function(doc){
//   if (doc.password){
//     doc.password = hashedPass({password: doc.password});
//     await doc.save()
//   }
// // });

const User = mongoose.model("User", userSchema);
export default User;
