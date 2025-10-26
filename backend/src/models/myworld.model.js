import mongoose from "mongoose";

const myWorldSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  goals: [{ type: String, trim: true, maxlength: 100 }],

  progress: {
    homework: { type: Number, default: 0 },
    habits: { type: Number, default: 0 },
    skills: { type: Number, default: 0 },
  },

  moodBoard: [{
    imageUrl: { type: String, match: /^https?:\/\/.+/, trim: true },
    caption: { type: String, trim: true }
  }],

  achievements: [{
    title: { type: String, trim: true },
    unlocked: { type: Boolean, default: false }
  }],

  journal: [{
    date: { type: Date },
    entry: { type: String, trim: true }
  }],

  soundtrack: [{
    title: { type: String, trim: true },
    url: { type: String, match: /^https?:\/\/.+/, trim: true }
  }],

  theme: {
    type: String,
    enum: ["light", "dark", "solarized"],
    default: "light"
  },

  avatar: {
    type: String,
    match: /^https?:\/\/.+/,
    trim: true
  }
}, { timestamps: true });

export default mongoose.model("MyWorld", myWorldSchema);