import mongoose, { Mongoose } from "mongoose";
import slugify from "slugify";

let productSchema = mongoose.Schema(
  {
    //====== titles ======//
    title: {
      type: String,
      trim: true,
      unique: [true, "Product name is required"],
      minlength: [2, "too short Product name"],
    },
    slug: {
      type: String,
      lowercase: true,
      // required: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 20,
      maxlength: 2000,
    },
    //====== images ======//
    imageCover: {
      type: Object,
      required: true, 
    },
    subImages: [Object],
    //====== price =======//
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      min: 0,
      max:100
    },
    //====== specific actions =====//
    size: [String],
    colors: [String],
    stock: {
      type: Number,
      min: 0,
      default: 1
    },
    //====== id's =======//
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, //todo true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, //todo true
    },
    rate:{
      type : Number,
      min:0,
      max:5,
      default: 5
    }
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON : {virtuals: true}, //json res
    toObject: {virtuals: true} //log
  }
);

productSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title, { lower: true });
  }
  next();
});

productSchema.virtual('finalPrice').get(function(){
  return this.price - (this.price * ( (this.discount || 0) /100))
})

productSchema.methods.instock= function (quentity) {
  return this.stock >= quentity ? true : false
}

//get Reviews for specific product with virtual populate
productSchema.virtual('Reviews',{
ref : 'Review',
localField: '_id',
foreignField: 'product'
});
productSchema.pre('findOne', function(){
  this.populate('Reviews')
});


let Product = mongoose.model("Product", productSchema);
export default Product;
