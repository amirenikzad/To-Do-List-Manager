import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Routes, Route, Navigate } from "react-router-dom";
import ToDo from './ToDo'

function App() {

  return (
    <div className="app">
      <main className="content">
        <Routes>
          <Route path="/" element={<ToDo />} />
          
          {/* <Route
            path="/Dashboard"
            element={
              isLoggedIn ? <Dashboard /> : <Navigate to="/" />
            }
          /> */}
        </Routes>
      </main>
    </div>
  )
}

export default App
