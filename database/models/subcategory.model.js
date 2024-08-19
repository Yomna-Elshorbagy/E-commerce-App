import mongoose from "mongoose";
import slugify from "slugify";

let subcategorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: [true, "Sub Category name is required"],
      minlength: [2, "too short Sub category name"],
    },
    slug: {
      type: String,
      lowercase: true,
      require: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId, 
        ref : 'Category' 
    },
    image: {
      type: Object, 
      required: [true, "image is required"]
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

subcategorySchema.pre("save", function (next) {
  if (!this.isModified("name")) return next();
  this.slug = slugify(this.name, { lower: true });
  next();
});


let SubCategory = mongoose.model("SubCategory", subcategorySchema);

export default SubCategory;
