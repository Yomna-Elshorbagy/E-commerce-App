import mongoose, { Schema } from "mongoose";
import { orderStatus, payments } from "../../src/utils/constant/enums.js";

const orderSchema = new Schema({
    user:{
        type: mongoose.Types.ObjectId, 
        ref:'User',
    },
    products:[
        {
            productId:{ 
                type: mongoose.Types.ObjectId, 
                ref:'Product',
                required: true
            },
            title: String,
            price: Number,
            quentity: Number,
            finalPrice: Number
        }
    ],
    address:{ type: String, require: true},
    phone:{ type: String, require: true},
    coupon:{ 
        couponId: {type: mongoose.Types.ObjectId, ref: 'Coupon'},
        code: String,
        discount:Number
    },
    status :{
        type: String,
        enum :Object.values(orderStatus),
        default:orderStatus.PLACED
    },
    payment:{
        type: String,
        enum: Object.values(payments),
        required: true
    },
    orderPrice: Number,
    finalPrice: Number
},{
    timestamps: true,
    versionKey: false,
});

const Order = mongoose.model("Order", orderSchema);
export default Order;