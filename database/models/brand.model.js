import mongoose from "mongoose";
import slugify from "slugify";

let brandSchema = mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      unique: [true, "Brand name is required"],
      minlength: [2, "too short Brand name"],
      lowercase: true,
    },
    slug: {
      type: String,
      lowercase: true,
      require: true,
    },
    logo: {
      type: Object,
      require: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
    }
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

brandSchema.pre("save", function (next) {
  if (!this.isModified("name")) return next();
  this.slug = slugify(this.name, { lower: true });
  next();
});

// brandSchema.post("init", function(docs){
//   docs.logo ="http://localhost:5000/uploads/brands/" + docs.logo
// });

let Brand = mongoose.model("Brand", brandSchema);

export default Brand;
