# Upload Form Debugging Guide

## Problem: "Invalid course reference" Error

### Error Details
- **Error Message**: "Invalid course reference"
- **HTTP Status**: 400 Bad Request
- **API Endpoint**: `POST /api/past-questions`
- **Form Data Example**: 
  ```
  {
    title: 'loop',
    course: '691e2abf82b567691b72774a',
    academicYear: '2020/2020',
    semester: '2',
    level: '300'
  }
  ```

## Root Cause Analysis

### Frontend Behavior (Correct)
- CourseDropdown component sends MongoDB ObjectId (`course._id`)
- Line 75 in `CourseDropdown.jsx`: `onChange?.(course ? course._id : '')`
- This is the proper way to reference a course in the database

### Backend Issue (Fixed)
- `handleCourseReference` function only looked up courses by `courseCode` field
- Failed to handle MongoDB ObjectIds properly
- The function expected course codes like "CS101" but received ObjectIds like "691e2abf82b567691b72774a"

## Solution Implemented

### Backend Fix: Enhanced `handleCourseReference` Function

**File**: `backend/controllers/pastQuestionController.js`

**Before**:
```javascript
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
                level: '100',
                semester: '1'
            });
        }
        return course._id;
    } catch (error) {
        return null;
    }
};
```

**After**:
```javascript
const handleCourseReference = async (courseData) => {
    if (!courseData) {
        return null;
    }

    try {
        // Check if it's already a valid MongoDB ObjectId (24 character hex string)
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(courseData);
        
        if (isObjectId) {
            // It's an ObjectId, try to find the course by ID first
            const course = await Course.findById(courseData);
            if (course) {
                console.log('Found course by ObjectId:', course.courseCode);
                return course._id;
            }
        }
        
        // If not an ObjectId or ObjectId not found, treat as course code
        if (typeof courseData === 'string') {
            let course = await Course.findOne({ courseCode: courseData.toUpperCase() });
            if (!course) {
                course = await Course.create({
                    courseCode: courseData.toUpperCase(),
                    courseName: courseData,
                    level: '100',
                    semester: '1'
                });
                console.log('Auto-created course:', course.courseCode);
            }
            return course._id;
        }
        
        return null;
    } catch (error) {
        console.error('Error handling course reference:', error);
        return null;
    }
};
```

### Key Improvements

1. **ObjectId Detection**: Uses regex pattern `/^[0-9a-fA-F]{24}$/` to identify valid MongoDB ObjectIds
2. **Dual Lookup Strategy**: 
   - First tries to find course by ObjectId
   - Falls back to course code lookup if ObjectId lookup fails
3. **Better Error Handling**: Added logging for debugging and better error messages
4. **Backward Compatibility**: Still supports the old course code approach

## Testing the Fix

### Steps to Verify

1. **Backend Server**: Ensure the backend server is running with the fix
   ```bash
   cd backend
   npm start
   ```

2. **Frontend Server**: Ensure the frontend is running
   ```bash
   cd university-past-questions-frontend
   npm run dev
   ```

3. **Test Upload**:
   - Navigate to Admin Panel
   - Click "Upload Question"
   - Fill in required fields:
     - Title: "Test Question"
     - Course: Select any course from dropdown
     - Academic Year: "2024/2025"
     - Upload any valid file
   - Submit the form

### Expected Behavior

✅ **Success**: Question uploads without errors
✅ **Course Association**: Question correctly associates with selected course
✅ **File Upload**: File uploads successfully
✅ **Database Entry**: New question appears in admin panel

## Related Files

### Frontend Files
- `university-past-questions-frontend/src/components/admin/CourseDropdown.jsx` - Course selection component
- `university-past-questions-frontend/src/components/admin/UploadForm.jsx` - Upload form component
- `university-past-questions-frontend/src/api/pastQuestionsApi.js` - API client

### Backend Files
- `backend/controllers/pastQuestionController.js` - Main controller (FIXED)
- `backend/models/Course.js` - Course model
- `backend/models/PastQuestion.js` - PastQuestion model

## Debugging Tips

### Console Logs to Check

1. **Backend Console**: Look for course lookup messages
   ```
   Found course by ObjectId: CS101
   Auto-created course: NEW101
   ```

2. **Frontend Console**: Check form data submission
   ```
   Form Data: {title: '...', course: '...', ...}
   ```

### Database Queries

To verify course exists in database:
```javascript
// In MongoDB shell or through admin panel
db.courses.findOne({_id: "691e2abf82b567691b72774a"})
```

### Common Issues and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Invalid course reference" | ObjectId not recognized | Verify backend has the fix applied |
| Course dropdown empty | API not responding | Check backend server status |
| File upload fails | File type/size issues | Check file validation in UploadForm |
| Authentication error | Token expired | Log out and log back in |

## Prevention

### Best Practices

1. **Consistent Data Types**: Ensure frontend and backend agree on field types
2. **Comprehensive Testing**: Test with both ObjectIds and course codes
3. **Error Logging**: Add detailed logging for debugging
4. **Input Validation**: Validate inputs on both frontend and backend
5. **API Documentation**: Document expected field formats

### Code Review Checklist

- [ ] Frontend sends correct data types
- [ ] Backend handles multiple input formats
- [ ] Error messages are descriptive
- [ ] Logging provides debugging information
- [ ] Database queries are efficient
- [ ] Validation prevents invalid data

## Future Improvements

1. **Schema Validation**: Use Joi or similar for request validation
2. **API Documentation**: Add comprehensive API docs with examples
3. **Automated Testing**: Unit tests for course lookup functionality
4. **Error Boundaries**: Better error handling in React components
5. **Loading States**: Better UX during API calls

---

*Last Updated: 2025-11-20*
*Status: FIXED*
