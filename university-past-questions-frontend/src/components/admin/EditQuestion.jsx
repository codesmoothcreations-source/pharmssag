import React, { useState, useEffect } from 'react'
import { FaSave, FaTimes, FaTrash, FaCheck, FaPlus } from 'react-icons/fa'
import { updateQuestion, deleteQuestion } from '../../api/pastQuestionsApi'
import './EditQuestion.css'

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

  // Sample course options
  const courseOptions = [
    'PHAR101 - African Studies',
    'PHAR102 - Computer Literacy', 
    'PHAR103 - Communication Skills I',
    'PHAR104 - General Chemistry I',
    'PHAR105 - Algebra & Trigonometry',
    'PHAR106 - Physics for Pharmacy'
  ]

  useEffect(() => {
    if (question) {
      setFormData({
        title: question.title || '',
        course: question.course || '',
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
      const token = localStorage.getItem('token')
      
      if (!token) {
        setError('Authentication required. Please log in again.')
        setLoading(false)
        return
      }

      const updatedQuestion = await updateQuestion(
        question._id || question.id,
        formData,
        token
      )
      
      setSuccess(true)
      setTimeout(() => {
        onSave(updatedQuestion)
      }, 800)
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update question. Please try again.')
      console.error('Update error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        setError('Authentication required. Please log in again.')
        setLoading(false)
        return
      }

      await deleteQuestion(question._id || question.id, token)
      onDelete(question._id || question.id)
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete question. Please try again.')
      console.error('Delete error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!question) {
    return (
      <div className="edit-question card">
        <div className="loading-state">
          <div className="loading-dots">
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
    <div className="edit-question card">
      <div className="form-header">
        <h2>Edit Past Question</h2>
        <button 
          onClick={onCancel} 
          className="close-btn" 
          disabled={loading}
          aria-label="Close"
        >
          <FaTimes />
        </button>
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="success-message" role="alert">
          <FaCheck className="success-animation" />
          Question updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="edit-form-content">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Question Title *
            </label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter question title..."
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="course" className="form-label">
              Course *
            </label>
            <select
              id="course"
              name="course"
              value={formData.course}
              onChange={handleInputChange}
              className="form-select"
              required
              disabled={loading}
            >
              <option value="">Select a course</option>
              {courseOptions.map(course => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="academicYear" className="form-label">
              Academic Year *
            </label>
            <input
              id="academicYear"
              type="text"
              name="academicYear"
              value={formData.academicYear}
              onChange={handleInputChange}
              className="form-input"
              placeholder="e.g., 2022/2023"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="level" className="form-label">
              Level *
            </label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              className="form-select"
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

          <div className="form-group">
            <label htmlFor="semester" className="form-label">
              Semester *
            </label>
            <select
              id="semester"
              name="semester"
              value={formData.semester}
              onChange={handleInputChange}
              className="form-select"
              required
              disabled={loading}
            >
              <option value="1">First Semester</option>
              <option value="2">Second Semester</option>
            </select>
          </div>
        </div>

        {/* Tags Section */}
        <div className="form-group">
          <label className="form-label">Tags</label>
          <div className="tags-input">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagInputKeyPress}
              className="form-input"
              placeholder="Add tags and press Enter"
              disabled={loading}
            />
            <button 
              type="button" 
              onClick={addTag} 
              className="btn btn-outline btn-sm"
              disabled={loading || !tagInput.trim()}
            >
              <FaPlus />
            </button>
          </div>
          <div className="tags-list">
            {formData.tags.map(tag => (
              <span key={tag} className="tag">
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
              <span className="no-tags">No tags added yet</span>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <div className="action-left">
            <button 
              type="button" 
              onClick={handleDelete}
              className="btn btn-outline delete-btn"
              disabled={loading}
            >
              <FaTrash />
              {loading ? (
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                'Delete Question'
              )}
            </button>
          </div>
          <div className="action-right">
            <button 
              type="button" 
              onClick={onCancel} 
              className="btn btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="loading-dots">
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