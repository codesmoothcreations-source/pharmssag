import React, { useState, useEffect } from 'react'
import { FaSave, FaTimes, FaTrash, FaCheck, FaPlus } from 'react-icons/fa'
import { getAllCourses } from '../../api/coursesApi'
import styles from './EditQuestion.module.css'

const EditQuestion = ({ question, onSave, onCancel, onDelete }) => {
  const [formData, setFormData] = useState({
    title: '',
    course: '',
    academicYear: '',
    semester: '1',
    level: '100',
    tags: []
  })

  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [courses, setCourses] = useState([])

  // Fetch courses from database
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getAllCourses()
        const coursesData = response.data || response
        setCourses(Array.isArray(coursesData) ? coursesData : [])
      } catch (err) {
        
        setError('Failed to load courses')
      }
    }

    fetchCourses()
  }, [])

  useEffect(() => {
    if (question) {
      setFormData({
        title: question.title || '',
        course: question.course?._id || question.course || '',
        academicYear: question.academicYear || '',
        semester: question.semester?.toString() || '1',
        level: question.level || '100',
        tags: question.tags || []
      })
    }
  }, [question])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  const addTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }))
      setTagInput('')
    }
  }

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Call the parent component's save handler with form data
      // The parent (AdminPanel) will handle the API call
      await onSave(formData)
      
      setSuccess(true)
      // Close modal after successful save
      setTimeout(() => {
        onCancel()
      }, 1200)
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update question. Please try again.')
      
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      onDelete(question._id || question.id)
    }
  }

  if (!question) {
    return (
      <div className={styles.editQuestion}>
        <div className={styles.loadingState}>
          <div className={styles.loadingDots}>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p>Loading question...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.editQuestion}>
      <div className={styles.formHeader}>
        <h2>Edit Past Question</h2>
        <button 
          onClick={onCancel} 
          className={styles.closeBtn} 
          disabled={loading}
          aria-label="Close"
        >
          <FaTimes />
        </button>
      </div>

      {error && (
        <div className={styles.errorMessage} role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className={styles.successMessage} role="alert">
          <FaCheck className={styles.successAnimation} />
          Question updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.editFormContent}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.formLabel}>
              Question Title *
            </label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={styles.formInput}
              placeholder="Enter question title..."
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="course" className={styles.formLabel}>
              Course *
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
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>
                  {course.courseCode} - {course.courseName}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="academicYear" className={styles.formLabel}>
              Academic Year *
            </label>
            <input
              id="academicYear"
              type="text"
              name="academicYear"
              value={formData.academicYear}
              onChange={handleInputChange}
              className={styles.formInput}
              placeholder="e.g., 2022/2023"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="level" className={styles.formLabel}>
              Level *
            </label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              className={styles.formSelect}
              required
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
              Semester *
            </label>
            <select
              id="semester"
              name="semester"
              value={formData.semester}
              onChange={handleInputChange}
              className={styles.formSelect}
              required
              disabled={loading}
            >
              <option value="1">First Semester</option>
              <option value="2">Second Semester</option>
            </select>
          </div>
        </div>

        {/* Tags Section */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Tags</label>
          <div className={styles.tagsInput}>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagInputKeyPress}
              className={styles.formInput}
              placeholder="Add tags and press Enter"
              disabled={loading}
            />
            <button 
              type="button" 
              onClick={addTag} 
              className={styles.btnOutlineSm}
              disabled={loading || !tagInput.trim()}
            >
              <FaPlus />
            </button>
          </div>
          <div className={styles.tagsList}>
            {formData.tags.map(tag => (
              <span key={tag} className={styles.tag}>
                {tag}
                <button 
                  type="button" 
                  onClick={() => removeTag(tag)}
                  disabled={loading}
                  aria-label={`Remove ${tag} tag`}
                >
                  <FaTimes />
                </button>
              </span>
            ))}
            {formData.tags.length === 0 && (
              <span className={styles.noTags}>No tags added yet</span>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className={styles.formActions}>
          <div className={styles.actionLeft}>
            <button 
              type="button" 
              onClick={handleDelete}
              className={`${styles.btn} ${styles.btnOutline} ${styles.deleteBtn}`}
              disabled={loading}
            >
              <FaTrash />
              {loading ? (
                <div className={styles.loadingDots}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                'Delete Question'
              )}
            </button>
          </div>
          <div className={styles.actionRight}>
            <button 
              type="button" 
              onClick={onCancel} 
              className={`${styles.btn} ${styles.btnOutline}`}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`${styles.btn} ${styles.btnPrimary}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className={styles.loadingDots}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default EditQuestion