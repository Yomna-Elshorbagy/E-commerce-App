import mongoose from "mongoose";
import { couponTypes } from "../../src/utils/constant/enums.js";

let couponSchema = mongoose.Schema(
  {
    code: {
      type: String,
      require: true,
      unique: true,
      lowerCase: true,
    },
    type: {
      type: String,
      enum: Object.values(couponTypes),
      require: true,
      default: couponTypes.FIXED_AMOUNT,
    },
    fromDate: {
      type: Date,
      default: Date.now(),
      validate: {
        validator: function(value) {
          return value >= Date.now();
        },
        message: 'coupon should start fom today or later',
      },
    },
    expire: {
      type: Date,
      default: Date.now() + 24 * 60 * 60 * 1000,
      validate: {
        validator: function(value) {
          return value > Date.now();
        },
        message: 'Expiration date must be in the future',
      },
    },
    discount: {
      type: Number,
      min: 1,
    },
    assignedUser: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        maxUser: { type: Number, default: 10, max: 10 },
        useCount: Number
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

let Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
