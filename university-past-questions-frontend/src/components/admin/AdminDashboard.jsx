import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getAllQuestions, updateQuestion, uploadQuestion, deleteQuestion } from '../../api/pastQuestionsApi'
import { getAllCourses } from '../../api/coursesApi'
import Table from '../common/Table'
import styles from './AdminDashboard.module.css'

const AdminDashboard = () => {
  const [pastQuestions, setPastQuestions] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null })
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    title: '',
    course: '',
    academicYear: '',
    semester: '',
    level: '100',
    fileUrl: '',
    description: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [questionsResponse, coursesResponse] = await Promise.all([
        getAllQuestions(),
        getAllCourses()
      ])
      setPastQuestions(questionsResponse.data || questionsResponse)
      setCourses(coursesResponse.data || coursesResponse)
    } catch (err) {
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const fetchPastQuestions = async () => {
    try {
      setLoading(true)
      const response = await getAllQuestions()
      setPastQuestions(response.data || response)
    } catch (err) {
      setError('Failed to fetch past questions')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingQuestion) {
        const token = localStorage.getItem('token')
        await updateQuestion(editingQuestion._id, formData, token)
      } else {
        const token = localStorage.getItem('token')
        await uploadQuestion(formData, token)
      }
      await fetchPastQuestions()
      resetForm()
    } catch (err) {
      setError('Failed to save past question')
    }
  }

  // Handle sorting
  const handleSort = useCallback((key) => {
    let direction = 'asc'
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    
    setSortConfig({ key, direction })
    
    // Sort the data
    const sortedQuestions = [...pastQuestions].sort((a, b) => {
      let aValue = a[key]
      let bValue = b[key]
      
      // Handle nested objects (like course)
      if (key.includes('.')) {
        const keys = key.split('.')
        aValue = keys.reduce((obj, k) => obj?.[k], a)
        bValue = keys.reduce((obj, k) => obj?.[k], b)
      }
      
      // Handle dates
      if (key === 'createdAt') {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
        return direction === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      // Handle strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      // Handle numbers
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      return 0
    })
    
    setPastQuestions(sortedQuestions)
  }, [sortConfig, pastQuestions])

  const handleEdit = (question) => {
    setEditingQuestion(question)
    setFormData({
      title: question.title || '',
      course: question.course?._id || question.course || '',
      academicYear: question.academicYear || '',
      semester: question.semester || '',
      level: question.level || '100',
      fileUrl: question.fileUrl || '',
      description: question.description || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        const token = localStorage.getItem('token')
        await deleteQuestion(id, token)
        await fetchPastQuestions()
      } catch (err) {
        setError('Failed to delete past question')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      course: '',
      academicYear: '',
      semester: '',
      level: '100',
      fileUrl: '',
      description: ''
    })
    setEditingQuestion(null)
    setShowForm(false)
  }

  // Table columns configuration
  const tableColumns = [
    {
      key: 'title',
      title: 'Title',
      sortable: true,
      render: (value, item) => (
        <div className={styles.questionTitle}>
          <strong>{value || 'Untitled'}</strong>
          {item.description && (
            <div className={styles.questionDescription}>
              {item.description}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'course.courseCode',
      title: 'Course',
      sortable: true,
      render: (value, item) => {
        const course = item.course
        return course ? (
          <div>
            <strong>{course.courseCode}</strong>
            <div className={styles.courseName}>
              {course.courseName}
            </div>
          </div>
        ) : (
          <span className={styles.noCourse}>No course assigned</span>
        )
      }
    },
    {
      key: 'academicYear',
      title: 'Academic Year',
      sortable: true,
      render: (value) => value || 'N/A'
    },
    {
      key: 'level',
      title: 'Level',
      sortable: true,
      render: (value) => value ? `Level ${value}` : 'N/A'
    },
    {
      key: 'semester',
      title: 'Semester',
      sortable: true,
      render: (value) => {
        switch (value) {
          case '1': return 'First'
          case '2': return 'Second'
          default: return 'N/A'
        }
      }
    },
    {
      key: 'createdAt',
      title: 'Created',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'actions',
      title: 'Actions',
      sortable: false,
      render: (value, item) => (
        <div className={styles.actionButtons}>
          <button
            className={styles.btnEdit}
            onClick={() => handleEdit(item)}
            title="Edit question"
            aria-label={`Edit question: ${item.title || 'Untitled'}`}
          >
            Edit
          </button>
          <button
            className={styles.btnDelete}
            onClick={() => handleDelete(item._id)}
            title="Delete question"
            aria-label={`Delete question: ${item.title || 'Untitled'}`}
          >
            Delete
          </button>
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <div className={styles.loadingContainer} role="status" aria-live="polite" aria-label="Loading past questions">
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Loading past questions...</p>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <div className={styles.dashboardHeader}>
        <h1>Admin Dashboard</h1>
        <button
          className={styles.btnPrimary}
          onClick={() => setShowForm(!showForm)}
          aria-expanded={showForm}
          aria-controls="question-form"
        >
          {showForm ? 'Cancel' : 'Add New Question'}
        </button>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      {showForm && (
        <div className={styles.formSection} id="question-form" role="region" aria-labelledby="form-title">
          <h2 id="form-title">{editingQuestion ? 'Edit Question' : 'Add New Question'}</h2>
          <form onSubmit={handleSubmit} className={styles.questionForm}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="title">Title</label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  required
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="course">Course</label>
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
                <label className={styles.formLabel} htmlFor="academicYear">Academic Year</label>
                <input
                  id="academicYear"
                  type="text"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  placeholder="e.g., 2023/2024"
                  required
                  disabled={loading}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="semester">Semester</label>
                <select
                  id="semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  className={styles.formSelect}
                  required
                  disabled={loading}
                >
                  <option value="">Select Semester</option>
                  <option value="1">First Semester</option>
                  <option value="2">Second Semester</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="level">Level</label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className={styles.formSelect}
                  required
                  disabled={loading}
                >
                  <option value="100">100 Level</option>
                  <option value="200">200 Level</option>
                  <option value="300">300 Level</option>
                  <option value="400">400 Level</option>
                  <option value="500">500 Level</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="fileUrl">File URL</label>
                <input
                  id="fileUrl"
                  // type="url"
                  name="fileUrl"
                  value={formData.fileUrl}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  placeholder="https://example.com/file.pdf"
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={styles.formTextarea}
                rows="3"
                placeholder="Optional description..."
                disabled={loading}
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.btnPrimary}
                disabled={loading}
                aria-describedby="submit-description"
              >
                {editingQuestion ? 'Update Question' : 'Add Question'}
              </button>
              <button
                type="button"
                className={styles.btnOutline}
                onClick={resetForm}
                disabled={loading}
              >
                Cancel
              </button>
              <span id="submit-description" className="sr-only">
                {loading ? 'Processing your request' : 'Form is ready for submission'}
              </span>
            </div>
          </form>
        </div>
      )}

      <div className={styles.questionsSection} role="region" aria-label="Past questions list">
        <h2>Past Questions ({pastQuestions.length})</h2>
        
        <Table
          data={pastQuestions}
          columns={tableColumns}
          loading={loading}
          emptyMessage="No past questions found. Add your first question!"
          onSort={handleSort}
          sortConfig={sortConfig}
          pagination={{
            itemsPerPage: 10
          }}
          ariaLabel="Past questions management table"
          testId="past-questions-table"
        />
      </div>
    </div>
  )
}

export default AdminDashboard