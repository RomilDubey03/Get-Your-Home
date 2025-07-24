import mongoose, { Schema } from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    regularPrice: {
      type: Number,
      required: true,
      min: [0, 'Regular price cannot be negative'],
    },
    discountPrice: {
      type: Number,
      required: true,
      min: [0, 'Discount price cannot be negative'],
    },
    bathrooms: {
      type: Number,
      required: true,
      min: [0, 'Bathrooms cannot be negative'],
      default: 0.5
    },
    bedrooms: {
      type: Number,
      required: true,
      min: [0, 'Bedrooms cannot be negative'],
      default: 0
    },
    furnished: {
      type: Boolean,
      required: true,
      default: false
    },
    parking: {
      type: Boolean,
      required: true,
      default: false
    },
    type: {
      type: String,
      required: true,
      enum: ['rent', 'sale'],
      lowercase: true,
      trim: true,
      index: true
    },
    offer: {
      type: Boolean,
      required: true,
      default: false
    },
    imageUrls: {
      type: [String],
      required: true,
      default: [],
    },
    userRef: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

listingSchema.pre("save", async function (next) {
    if (this.isModified("offer") || this.isModified("regularPrice") || this.isModified("discountPrice")) {
        if (this.offer && this.discountPrice > this.regularPrice) {
            this.discountPrice = this.regularPrice;
            console.warn("Discount price was higher than regular price with offer. Adjusted to regular price.");
        } else if (!this.offer && this.discountPrice !== this.regularPrice) {
            this.discountPrice = this.regularPrice;
            console.info("No offer detected. Discount price set to match regular price.");
        }
    }
    next();
});

listingSchema.methods.isDiscounted = function () {
    return this.offer && this.discountPrice < this.regularPrice;
};

listingSchema.methods.getEffectivePrice = function () {
    return this.isDiscounted() ? this.discountPrice : this.regularPrice;
};

// listingSchema.methods.generateShareLink = function (baseUrl) {
//     if (!baseUrl) {
//         console.warn("Base URL not provided for generateShareLink. Returning partial link.");
//         return `/listings/${this._id}`;
//     }
//     return `${baseUrl}/listings/${this._id}`;
// };


const Listing = mongoose.model('Listing', listingSchema);

export default Listing;