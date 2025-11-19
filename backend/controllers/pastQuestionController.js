const PastQuestion = require('../models/PastQuestion');
const Course = require('../models/Course');

// Helper function to handle course creation/lookup
const handleCourseReference = async (courseData) => {
    if (!courseData || typeof courseData !== 'string') {
        return null;
    }

    try {
        let course = await Course.findOne({ courseCode: courseData.toUpperCase() });
        if (!course) {
            course = await Course.create({
                courseCode: courseData.toUpperCase(),
                courseName: courseData,
                level: '100', // Default level
                semester: '1'  // Default semester
            });
            
        }
        return course._id;
    } catch (error) {
        
        return null;
    }
};

/**
 * @desc    Get all past questions with filtering and pagination
 * @route   GET /api/past-questions
 * @access  Public
 */
const getPastQuestions = async (req, res) => {
    try {
        // Build query object for filtering
        let query = { isApproved: true };
        
        // Filter by level
        if (req.query.level) {
            query.level = req.query.level;
        }
        
        // Filter by semester
        if (req.query.semester) {
            query.semester = req.query.semester;
        }
        
        // Filter by course - need to lookup course by code first
        // Support both 'course' and 'courseCode' parameters for flexibility
        const courseQuery = req.query.course || req.query.courseCode;
        if (courseQuery) {
            try {
                
                // First find the course by code
                const course = await Course.findOne({ courseCode: courseQuery.toUpperCase() });
                if (course) {
                    query.course = course._id;
                    
                } else {
                    
                    // If course not found, return empty results
                    return res.json({
                        success: true,
                        count: 0,
                        pagination: { page: 1, pages: 0, total: 0 },
                        data: []
                    });
                }
            } catch (error) {
                
                return res.json({
                    success: true,
                    count: 0,
                    pagination: { page: 1, pages: 0, total: 0 },
                    data: []
                });
            }
        }
        
        // Search in title and tags
        if (req.query.search) {
            query.$text = { $search: req.query.search };
        }

        

        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Execute query with population and pagination
        const pastQuestions = await PastQuestion.find(query)
            .populate('course', 'courseCode courseName level semester')
            .populate('uploader', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get total count for pagination
        const total = await PastQuestion.countDocuments(query);

        

        res.json({
            success: true,
            count: pastQuestions.length,
            pagination: {
                page,
                pages: Math.ceil(total / limit),
                total
            },
            data: pastQuestions
        });
    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

/**
 * @desc    Get single past question
 * @route   GET /api/past-questions/:id
 * @access  Public
 */
const getPastQuestion = async (req, res) => {
    try {
        const pastQuestion = await PastQuestion.findById(req.params.id)
            .populate('course', 'courseCode courseName level semester')
            .populate('uploader', 'name email');

        if (!pastQuestion) {
            return res.status(404).json({
                success: false,
                message: 'Past question not found'
            });
        }

        // Increment view count
        pastQuestion.viewCount += 1;
        await pastQuestion.save();

        res.json({
            success: true,
            data: pastQuestion
        });
    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

/**
 * @desc    Create new past question
 * @route   POST /api/past-questions
 * @access  Private
 */
const createPastQuestion = async (req, res) => {
    try {
        
        
        

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }

        // Add uploader to request body
        req.body.uploader = req.user.id;

        // Add file information
        req.body.fileUrl = req.file.path;
        req.body.fileType = req.file.mimetype.startsWith('image/') ? 'image' :
                           req.file.mimetype === 'application/pdf' ? 'pdf' : 'doc';
        req.body.fileSize = req.file.size;

        // Auto-approve if user is admin
        if (req.user.role === 'admin') {
            req.body.isApproved = true;
        }

        // Handle course reference - convert string to ObjectId
        if (req.body.course && typeof req.body.course === 'string') {
            const courseId = await handleCourseReference(req.body.course);
            if (courseId) {
                req.body.course = courseId;
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid course reference'
                });
            }
        }

        

        const pastQuestion = await PastQuestion.create(req.body);
        

        // Populate the created past question
        const populatedPastQuestion = await PastQuestion.findById(pastQuestion._id)
            .populate('course', 'courseCode courseName')
            .populate('uploader', 'name');

        res.status(201).json({
            success: true,
            data: populatedPastQuestion,
            message: 'Past question uploaded successfully' +
                    (req.user.role !== 'admin' ? ' - Waiting for admin approval' : '')
        });
    } catch (error) {
        
        
        res.status(500).json({
            success: false,
            message: 'Server error creating past question',
            error: error.message,
            details: error.errors
        });
    }
};

/**
 * @desc    Update question metadata only (no file required)
 * @route   PUT /api/past-questions/:id/metadata
 * @access  Private (Admin or Owner)
 */
const updateQuestionMetadata = async (req, res) => {
    try {
        
        

        let pastQuestion = await PastQuestion.findById(req.params.id);

        if (!pastQuestion) {
            return res.status(404).json({
                success: false,
                message: 'Past question not found'
            });
        }

        // Check if user is owner or admin
        if (pastQuestion.uploader.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this past question'
            });
        }

        // Handle course field if it's a string
        if (req.body.course && typeof req.body.course === 'string') {
            const courseId = await handleCourseReference(req.body.course);
            if (courseId) {
                req.body.course = courseId;
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid course reference'
                });
            }
        }

        

        pastQuestion = await PastQuestion.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate('course', 'courseCode courseName')
         .populate('uploader', 'name');

        

        res.json({
            success: true,
            data: pastQuestion,
            message: 'Past question metadata updated successfully'
        });
    } catch (error) {
        
        
        res.status(500).json({
            success: false,
            message: 'Server error updating past question metadata',
            error: error.message,
            details: error.errors
        });
    }
};

/**
 * @desc    Update past question
 * @route   PUT /api/past-questions/:id
 * @access  Private (Admin or Owner)
 */
const updatePastQuestion = async (req, res) => {
    try {
        
        
        

        let pastQuestion = await PastQuestion.findById(req.params.id);

        if (!pastQuestion) {
            return res.status(404).json({
                success: false,
                message: 'Past question not found'
            });
        }

        // Check if user is owner or admin
        if (pastQuestion.uploader.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this past question'
            });
        }

        // Handle course field if it's a string
        if (req.body.course && typeof req.body.course === 'string') {
            const courseId = await handleCourseReference(req.body.course);
            if (courseId) {
                req.body.course = courseId;
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid course reference'
                });
            }
        }

        // Only update file information if a new file was uploaded
        if (req.file) {
            req.body.fileUrl = req.file.path;
            req.body.fileType = req.file.mimetype.startsWith('image/') ? 'image' :
                               req.file.mimetype === 'application/pdf' ? 'pdf' : 'doc';
            req.body.fileSize = req.file.size;
        }

        

        pastQuestion = await PastQuestion.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).populate('course', 'courseCode courseName')
         .populate('uploader', 'name');

        

        res.json({
            success: true,
            data: pastQuestion,
            message: 'Past question updated successfully'
        });
    } catch (error) {
        
        
        res.status(500).json({
            success: false,
            message: 'Server error updating past question',
            error: error.message,
            details: error.errors
        });
    }
};

/**
 * @desc    Delete past question
 * @route   DELETE /api/past-questions/:id
 * @access  Private (Admin or Owner)
 */
const deletePastQuestion = async (req, res) => {
    try {
        const pastQuestion = await PastQuestion.findById(req.params.id);

        if (!pastQuestion) {
            return res.status(404).json({
                success: false,
                message: 'Past question not found'
            });
        }

        // Check if user is owner or admin
        if (pastQuestion.uploader.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this past question'
            });
        }

        await PastQuestion.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            data: {},
            message: 'Past question deleted successfully'
        });
    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Server error deleting past question',
            error: error.message
        });
    }
};

/**
 * @desc    Approve past question (Admin only)
 * @route   PUT /api/past-questions/:id/approve
 * @access  Private (Admin)
 */
const approvePastQuestion = async (req, res) => {
    try {
        const pastQuestion = await PastQuestion.findByIdAndUpdate(
            req.params.id,
            { isApproved: true },
            { new: true }
        ).populate('course', 'courseCode courseName')
         .populate('uploader', 'name email');

        if (!pastQuestion) {
            return res.status(404).json({
                success: false,
                message: 'Past question not found'
            });
        }

        res.json({
            success: true,
            data: pastQuestion,
            message: 'Past question approved successfully'
        });
    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Server error approving past question',
            error: error.message
        });
    }
};

/**
 * @desc    Download past question (tracks download count)
 * @route   GET /api/past-questions/:id/download
 * @access  Public
 */
const downloadPastQuestion = async (req, res) => {
    try {
        const pastQuestion = await PastQuestion.findById(req.params.id);

        if (!pastQuestion) {
            return res.status(404).json({
                success: false,
                message: 'Past question not found'
            });
        }

        // Increment download count
        pastQuestion.downloadCount += 1;
        await pastQuestion.save();

        // Serve the file
        const filePath = require('path').join(__dirname, '..', pastQuestion.fileUrl);
        res.download(filePath, `${pastQuestion.title}.${pastQuestion.fileType === 'pdf' ? 'pdf' : pastQuestion.fileType === 'image' ? 'png' : 'doc'}`);

    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Server error downloading past question',
            error: error.message
        });
    }
};

/**
 * @desc    Get filter options for dropdowns
 * @route   GET /api/past-questions/filters
 * @access  Public
 */
const getFilterOptions = async (req, res) => {
    try {
        // Get unique levels
        const levels = await PastQuestion.distinct('level', { isApproved: true });
        levels.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

        // Get unique semesters
        const semesters = await PastQuestion.distinct('semester', { isApproved: true });
        semesters.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

        // Get unique departments
        const departments = await PastQuestion.distinct('department', { isApproved: true });
        departments.sort();

        // Get unique academic years and format as yyyy/yyyy
        const academicYears = await PastQuestion.distinct('academicYear', { isApproved: true });
        const formattedYears = academicYears
            .filter(year => year && typeof year === 'string')
            .map(year => {
                // Convert formats like "2024" or "2023-2024" to "2023/2024"
                if (year.includes('-')) {
                    return year.replace('-', '/');
                } else if (year.match(/^\d{4}$/)) {
                    // Single year - assume next academic year
                    const nextYear = parseInt(year) + 1;
                    return `${year}/${nextYear}`;
                }
                return year;
            })
            .sort();

        // Get all courses for scrolling dropdown
        const courses = await Course.find({ isActive: true })
            .select('courseCode courseName level semester')
            .sort({ level: 1, semester: 1, courseCode: 1 });

        const formattedCourses = courses.map(course => ({
            value: course.courseCode,
            label: `${course.courseCode} - ${course.courseName}`,
            level: course.level,
            semester: course.semester,
            display: `${course.courseCode} (${course.level}.${course.semester})`
        }));

        res.json({
            success: true,
            data: {
                levels,
                semesters,
                departments,
                academicYears: formattedYears,
                courses: formattedCourses
            }
        });
    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Server error fetching filter options',
            error: error.message
        });
    }
};

module.exports = {
    getPastQuestions,
    getPastQuestion,
    createPastQuestion,
    updatePastQuestion,
    updateQuestionMetadata,
    deletePastQuestion,
    approvePastQuestion,
    downloadPastQuestion,
    getFilterOptions
};