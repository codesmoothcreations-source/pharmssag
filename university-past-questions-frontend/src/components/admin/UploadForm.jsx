import React, { useState, useRef, useCallback, useMemo } from 'react'
import { FaUpload, FaTimes, FaFilePdf, FaImage, FaCheck, FaFileWord, FaFilePowerpoint, FaFileAlt, FaTrash, FaPlus } from 'react-icons/fa'
import { uploadQuestion } from '../../api/pastQuestionsApi'
import LoadingSpinner from '../common/LoadingSpinner'
import styles from './UploadForm.module.css'

const UploadForm = ({ onUpload, onCancel, loading: externalLoading }) => {
  const [formData, setFormData] = useState({
    title: '',
    course: '',
    academicYear: '',
    semester: '1',
    level: '100',
    questionType: 'exam',
    difficultyLevel: 'intermediate',
    subjectArea: '',
    institution: '',
    faculty: '',
    department: '',
    tags: '',
    description: '',
    file: null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fileSelected, setFileSelected] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)
  const loadingProp = loading || externalLoading

  // Memoized course options for performance
  const courseOptions = useMemo(() => [
    { value: '', label: 'Select a course' },
    { value: 'PHAR101', label: 'PHAR101 - African Studies' },
    { value: 'PHAR102', label: 'PHAR102 - Computer Literacy' },
    { value: 'PHAR103', label: 'PHAR103 - Communication Skills I' },
    { value: 'PHAR104', label: 'PHAR104 - General Chemistry I' },
    { value: 'PHAR105', label: 'PHAR105 - Algebra & Trigonometry' },
    { value: 'PHAR106', label: 'PHAR106 - Physics for Pharmacy' },
    { value: 'CS101', label: 'CS101 - Introduction to Computer Science' },
    { value: 'MATH101', label: 'MATH101 - Calculus I' },
    { value: 'PHY101', label: 'PHY101 - General Physics I' },
    { value: 'CHEM101', label: 'CHEM101 - General Chemistry' },
    { value: 'BIO101', label: 'BIO101 - General Biology' },
    { value: 'ENG101', label: 'ENG101 - English Composition' }
  ], [])

  // Memoized subject areas for categorization
  const subjectAreas = useMemo(() => [
    { value: '', label: 'Select subject area' },
    { value: 'sciences', label: 'Natural Sciences' },
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'medicine', label: 'Medicine & Health Sciences' },
    { value: 'pharmacy', label: 'Pharmacy' },
    { value: 'arts', label: 'Arts & Humanities' },
    { value: 'social_sciences', label: 'Social Sciences' },
    { value: 'business', label: 'Business Administration' },
    { value: 'education', label: 'Education' },
    { value: 'law', label: 'Law' }
  ], [])

  // Memoized question types
  const questionTypes = useMemo(() => [
    { value: 'exam', label: 'Final Exam' },
    { value: 'midterm', label: 'Midterm Exam' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'assignment', label: 'Assignment' },
    { value: 'practical', label: 'Practical/Lab' },
    { value: 'paper', label: 'Research Paper' },
    { value: 'project', label: 'Project Work' }
  ], [])

  // Memoized difficulty levels
  const difficultyLevels = useMemo(() => [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
  ], [])

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }, [error])

  // Enhanced file validation with support for multiple formats
  const validateFile = (file) => {
    if (!file) return { valid: false, error: 'No file selected' }

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Unsupported file format. Please select PDF, Word, PowerPoint, image, or text files.'
      }
    }

    // Increased file size limit to 25MB for multiple file types
    const maxSize = 25 * 1024 * 1024
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size must be less than 25MB'
      }
    }

    return { valid: true }
  }

  const handleFileChange = useCallback((file) => {
    if (file) {
      const validation = validateFile(file)
      
      if (!validation.valid) {
        setError(validation.error)
        setFileSelected(false)
        setFormData(prev => ({ ...prev, file: null }))
        return
      }

      setFormData(prev => ({
        ...prev,
        file: file
      }))
      
      setFileSelected(true)
      setError('')
    }
  }, [])

  // Simulate upload progress for better UX
  const simulateProgress = () => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 30
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
      }
      setUploadProgress(progress)
    }, 200)
    
    return interval
  }

  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files[0]
    handleFileChange(file)
  }, [handleFileChange])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    handleFileChange(file)
  }, [handleFileChange])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setUploadProgress(0)

    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        setError('Authentication required. Please log in first.')
        setLoading(false)
        return
      }

      // Validate required fields
      const requiredFields = ['title', 'course', 'academicYear', 'questionType', 'subjectArea', 'institution']
      const missingFields = requiredFields.filter(field => !formData[field])
      
      if (missingFields.length > 0) {
        setError(`Please fill in all required fields: ${missingFields.join(', ')}`)
        setLoading(false)
        return
      }

      if (!formData.file) {
        setError('Please select a file to upload')
        setLoading(false)
        return
      }

      // Validate file
      const fileValidation = validateFile(formData.file)
      if (!fileValidation.valid) {
        setError(fileValidation.error)
        setLoading(false)
        return
      }

      // Start upload progress simulation
      const progressInterval = simulateProgress()

      // Create FormData for file upload
      const uploadData = new FormData()
      uploadData.append('title', formData.title)
      uploadData.append('course', formData.course)
      uploadData.append('academicYear', formData.academicYear)
      uploadData.append('semester', formData.semester)
      uploadData.append('level', formData.level)
      uploadData.append('questionType', formData.questionType)
      uploadData.append('difficultyLevel', formData.difficultyLevel)
      uploadData.append('subjectArea', formData.subjectArea)
      uploadData.append('institution', formData.institution)
      uploadData.append('faculty', formData.faculty)
      uploadData.append('department', formData.department)
      uploadData.append('tags', formData.tags)
      uploadData.append('description', formData.description)
      uploadData.append('file', formData.file)

      const newQuestion = await uploadQuestion(uploadData, token)
      
      // Clear progress interval
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      if (onUpload) {
        onUpload(uploadData)
      }
      onCancel()
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload question. Please try again.')
      setUploadProgress(0)
    } finally {
      setLoading(false)
    }
  }

  const getFileIcon = useCallback(() => {
    if (!formData.file) return <FaUpload className={styles.uploadIcon} aria-hidden="true" />
    
    const fileType = formData.file.type
    
    if (fileType.startsWith('image/')) {
      return <FaImage className={styles.uploadIcon} aria-hidden="true" />
    } else if (fileType === 'application/pdf') {
      return <FaFilePdf className={styles.uploadIcon} aria-hidden="true" />
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FaFileWord className={styles.uploadIcon} aria-hidden="true" />
    } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
      return <FaFilePowerpoint className={styles.uploadIcon} aria-hidden="true" />
    } else if (fileType === 'text/plain') {
      return <FaFileAlt className={styles.uploadIcon} aria-hidden="true" />
    }
    return <FaFileAlt className={styles.uploadIcon} aria-hidden="true" />
  }, [formData.file?.type])

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <h2>Enhanced Past Question Upload</h2>
            <p>Upload with comprehensive categorization fields</p>
          </div>

          {error && (
            <div className={styles.authError}>
              <div className={styles.errorIcon}>!</div>
              <div className={styles.errorMessage}>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.authForm}>
            {/* Basic Information Section */}
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Basic Information</h3>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="title" className={styles.formLabel}>
                    Question Title <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    placeholder="Enter comprehensive question title"
                    required
                    disabled={loading}
                    autoComplete="off"
                    maxLength="255"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="course" className={styles.formLabel}>
                    Course <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="course"
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    className={styles.formSelect}
                    required
                    disabled={loading}
                  >
                    {courseOptions.map(course => (
                      <option key={course.value} value={course.value}>
                        {course.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="academicYear" className={styles.formLabel}>
                    Academic Year <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="academicYear"
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    placeholder="e.g., 2023/2024"
                    required
                    disabled={loading}
                    pattern="[0-9]{4}\/[0-9]{4}"
                    title="Please enter academic year in format: 2023/2024"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="institution" className={styles.formLabel}>
                    Institution <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    id="institution"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    placeholder="University/College name"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Academic Classification Section */}
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Academic Classification</h3>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="level" className={styles.formLabel}>
                    Level
                  </label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className={styles.formSelect}
                    disabled={loading}
                  >
                    <option value="100">Level 100</option>
                    <option value="200">Level 200</option>
                    <option value="300">Level 300</option>
                    <option value="400">Level 400</option>
                    <option value="500">Level 500</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="semester" className={styles.formLabel}>
                    Semester
                  </label>
                  <select
                    id="semester"
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    className={styles.formSelect}
                    disabled={loading}
                  >
                    <option value="1">First Semester</option>
                    <option value="2">Second Semester</option>
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="questionType" className={styles.formLabel}>
                    Question Type <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="questionType"
                    name="questionType"
                    value={formData.questionType}
                    onChange={handleInputChange}
                    className={styles.formSelect}
                    required
                    disabled={loading}
                  >
                    {questionTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="difficultyLevel" className={styles.formLabel}>
                    Difficulty Level
                  </label>
                  <select
                    id="difficultyLevel"
                    name="difficultyLevel"
                    value={formData.difficultyLevel}
                    onChange={handleInputChange}
                    className={styles.formSelect}
                    disabled={loading}
                  >
                    {difficultyLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="subjectArea" className={styles.formLabel}>
                    Subject Area <span className={styles.required}>*</span>
                  </label>
                  <select
                    id="subjectArea"
                    name="subjectArea"
                    value={formData.subjectArea}
                    onChange={handleInputChange}
                    className={styles.formSelect}
                    required
                    disabled={loading}
                  >
                    {subjectAreas.map(area => (
                      <option key={area.value} value={area.value}>
                        {area.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="faculty" className={styles.formLabel}>
                    Faculty
                  </label>
                  <input
                    type="text"
                    id="faculty"
                    name="faculty"
                    value={formData.faculty}
                    onChange={handleInputChange}
                    className={styles.formInput}
                    placeholder="e.g., Science, Engineering"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="department" className={styles.formLabel}>
                  Department
                </label>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  placeholder="Specific department name"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Additional Information Section */}
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Additional Information</h3>
              
              <div className={styles.formGroup}>
                <label htmlFor="tags" className={styles.formLabel}>
                  Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  placeholder="e.g., calculus, derivatives, limits (comma separated)"
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description" className={styles.formLabel}>
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={styles.formTextarea}
                  rows="3"
                  placeholder="Additional context or instructions about this question..."
                  disabled={loading}
                />
              </div>
            </div>

            {/* Enhanced File Upload Section */}
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>File Upload</h3>
              
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Question File <span className={styles.required}>*</span>
                </label>
                
                <div
                  className={`${styles.fileUploadArea} ${loading ? styles.uploading : ''}`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => !loading && fileInputRef.current?.click()}
                  role="button"
                  tabIndex="0"
                  aria-label="File upload area - drag and drop or click to select"
                  aria-describedby="file-help"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileInputChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.txt"
                    className={styles.fileInput}
                    disabled={loading}
                    aria-describedby="file-help"
                  />
                  
                  <div className={styles.uploadPlaceholder}>
                    {fileSelected ? (
                      <div className={styles.fileInfo}>
                        <div className={styles.fileIconContainer}>
                          {getFileIcon()}
                        </div>
                        <div className={styles.fileDetails}>
                          <span className={styles.fileName}>{formData.file.name}</span>
                          <span className={styles.fileSize}>
                            {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                        {!loading && (
                          <button
                            type="button"
                            className={styles.removeFileBtn}
                            onClick={(e) => {
                              e.stopPropagation()
                              setFormData(prev => ({ ...prev, file: null }))
                              setFileSelected(false)
                              setError('')
                            }}
                            aria-label="Remove selected file"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className={styles.uploadPrompt}>
                        <FaPlus className={styles.uploadIcon} />
                        <span>Drag & drop your file here, or click to browse</span>
                      </div>
                    )}
                  </div>
                  
                  {loading && (
                    <div className={styles.uploadProgress}>
                      <div
                        className={styles.progressBar}
                        style={{ width: `${uploadProgress}%` }}
                      />
                      <span className={styles.progressText}>
                        {Math.round(uploadProgress)}% uploaded
                      </span>
                    </div>
                  )}
                </div>
                
                <small id="file-help" className={styles.fileHelp}>
                  Supported formats: PDF, Word (DOC/DOCX), PowerPoint (PPT/PPTX),
                  Images (JPG/PNG/GIF), Text files (TXT) • Max size: 25MB
                </small>
              </div>
            </div>

            <button
              type="submit"
              className={styles.authButton}
              disabled={loading || !formData.file}
            >
              {loading ? (
                <LoadingSpinner size="small" text="Uploading..." />
              ) : (
                'Upload Question'
              )}
            </button>
          </form>

          <div className={styles.authFooter}>
            <button
              type="button"
              onClick={onCancel}
              className={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UploadForm