import React, { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import Layout from './layouts/Layout'
import { ErrorBoundary } from './components/ErrorBoundary'

const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Builder = lazy(() => import('./pages/Builder'))
const JobBoard = lazy(() => import('./pages/JobBoard'))
const SharedResume = lazy(() => import('./pages/SharedResume'))
const ProjectReport = lazy(() => import('./pages/ProjectReport'))

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-xs font-bold text-slate-400">Loading Workspace...</p>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Toaster position="top-right" />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </Route>
            
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/builder" element={<Builder />} />
            <Route path="/dashboard/jobs" element={<JobBoard />} />
            <Route path="/share" element={<SharedResume />} />
            <Route path="/report" element={<ProjectReport />} />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  )
}

export default App

