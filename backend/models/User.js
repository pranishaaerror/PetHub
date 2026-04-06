import mongoose from "mongoose";

const generatePetHubId = () => {
  const stamp = Date.now().toString(36).slice(-5).toUpperCase();
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `PHU-${stamp}${random}`;
};

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    trim: true,
    default: null,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  petHubId: {
    type: String,
    required: true,
    unique: true,
    default: generatePetHubId,
  },
  contactNumber: {
    type: String,
    trim: true,
    default: null,
  },
  phoneNumber: {
    type : String,
    default: null
  },
  onboardingCompleted: {
    type: Boolean,
    required: true,
    default: false,
  },
  onboardingStep: {
    type: Number,
    default: 0,
  },
  onboardingDraft: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
    required: true,
  },
  avatar: {
    type: String,
    default: null,
  },
  preferences: {
    reminders: {
      type: Boolean,
      default: true,
    },
    bookingInterest: {
      type: Boolean,
      default: true,
    },
    adoptionInterest: {
      type: Boolean,
      default: true,
    },
    communityInterest: {
      type: Boolean,
      default: true,
    },
    notificationPreference: {
      type: String,
      default: "email-and-app",
    },
    carePlanPreference: {
      type: String,
      default: "balanced",
    },
  },
  // age: {
  //   type: Number,
  //   required: true
  // },
  emailVerified: {
    type: Boolean,
    required : true,
    default: false
  },
  disabled: {
    type:Boolean,
    required : true,
    default:false
  },
  displayName:{
    type: String,
    default: null,
  },
  photoURL : {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
    required: true,
  },
  
  metadata:{
    creationTime: {type: Date},
    lastSignInTime: {type: Date},
    lastRefreshTime: {type: Date}
  },
  providerData:[
    {
      uid: {type: String },
      providerId: { type: String },
      displayName: {type: String, default: null},
      email:{type: String},
      photoURL : {type: String},
      phoneNumber: {type: String, default:null}
      
    }
  ],
  passwordHash:{type : String, default:null},
  passwordSalt:{type: String, default: null},
  tokensValidAfterTime : {type:Date},
  tenantId:{type:String, default:null}



}, { timestamps: true });

userSchema.pre("save", function syncLegacyFields(next) {
  if (this.fullName && !this.displayName) {
    this.displayName = this.fullName;
  }

  if (this.displayName && !this.fullName) {
    this.fullName = this.displayName;
  }

  if (this.avatar && !this.photoURL) {
    this.photoURL = this.avatar;
  }

  if (this.photoURL && !this.avatar) {
    this.avatar = this.photoURL;
  }

  if (this.phoneNumber && !this.contactNumber) {
    this.contactNumber = this.phoneNumber;
  }

  if (this.contactNumber && !this.phoneNumber) {
    this.phoneNumber = this.contactNumber;
  }

  next();
});

export default mongoose.model("User", userSchema);
