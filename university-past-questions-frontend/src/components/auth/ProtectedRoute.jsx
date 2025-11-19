import React from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'
import { FaShieldAlt, FaUserShield, FaArrowLeft, FaHome } from 'react-icons/fa'
import './ProtectedRoute.css'

const ProtectedRoute = ({ children, requireAdmin = false }) => {
   const { isAuthenticated, isAdmin, loading } = useAuth()
   const location = useLocation()
   const navigate = useNavigate()

   
   

   // Show loading spinner while checking authentication
   if (loading) {
     
     return (
       <div className="auth-check-container">
         <LoadingSpinner
           text={requireAdmin ? "Checking admin permissions..." : "Checking authentication..."}
           fullScreen
           type="wave"
         />
       </div>
     )
   }

  // If not authenticated, redirect to login with return url
  if (!isAuthenticated) {
    
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    )
  }

  // If admin access is required but user is not admin
  if (requireAdmin && !isAdmin) {
    
    return (
      <div className={`access-denied ${requireAdmin ? 'admin-access-denied' : ''}`}>
        <div className="access-denied-content">
          <div className="access-denied-icon">
            {requireAdmin ? <FaUserShield /> : <FaShieldAlt />}
          </div>
          
          <h2>
            {requireAdmin ? 'Admin Access Required' : 'Access Denied'}
          </h2>
          
          <p>
            {requireAdmin 
              ? 'This area is restricted to administrators only.'
              : 'You don\'t have permission to access this page.'
            }
          </p>
          
          <p className="access-description">
            {requireAdmin
              ? 'You need administrator privileges to view this content. Please contact your system administrator if you believe this is an error.'
              : 'Please check your permissions or contact support if you believe this is an error.'
            }
          </p>

          <div className="access-denied-actions">
            <button
              className="btn btn-outline"
              onClick={() => window.history.back()}
            >
              <FaArrowLeft />
              Go Back
            </button>
            
            <button
              className="btn btn-primary"
              onClick={() => navigate('/')}
            >
              <FaHome />
              Go Home
            </button>
            
            {requireAdmin && (
              <button
                className="btn btn-outline"
                onClick={() => navigate('/contact')}
              >
                Contact Admin
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // User is authenticated (and admin if required), render children
  
  return (
    <div className="access-granted">
      {children}
    </div>
  )
}

export default ProtectedRoute