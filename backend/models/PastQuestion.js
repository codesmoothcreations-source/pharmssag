const mongoose = require('mongoose');

/**
 * Past Question Schema for storing exam papers and related data
 */
const pastQuestionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: [true, 'Please specify the course']
    },
    academicYear: {
        type: String,
        required: [true, 'Please add academic year'],
        match: [/^\d{4}\/\d{4}$/, 'Please use format: YYYY/YYYY']
    },
    semester: {
        type: String,
        required: [true, 'Please specify semester'],
        enum: ['1', '2']
    },
    level: {
        type: String,
        required: [true, 'Please specify academic level'],
        enum: ['100', '200', '300', '400', '500']
    },
    fileUrl: {
        type: String,
        required: [true, 'Please upload a file']
    },
    fileType: {
        type: String,
        required: true,
        enum: ['pdf', 'image', 'doc']
    },
    fileSize: {
        type: Number, // Size in bytes
        required: true
    },
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    downloadCount: {
        type: Number,
        default: 0
    },
    viewCount: {
        type: Number,
        default: 0
    },
    isApproved: {
        type: Boolean,
        default: false // Admin must approve uploads
    },
    youtubeLinks: [{
        title: String,
        url: String,
        videoId: String,
        channelTitle: String,
        publishedAt: Date
    }]
}, {
    timestamps: true
});

// Compound index for efficient searching and filtering
pastQuestionSchema.index({ level: 1, semester: 1, course: 1 });
pastQuestionSchema.index({ title: 'text', tags: 'text' });

/**
 * Static method to get popular past questions
 */
pastQuestionSchema.statics.getPopular = function() {
    return this.find({ isApproved: true })
        .sort({ downloadCount: -1, viewCount: -1 })
        .limit(10)
        .populate('course', 'courseCode courseName')
        .populate('uploader', 'name');
};

module.exports = mongoose.model('PastQuestion', pastQuestionSchema);