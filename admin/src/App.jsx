import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { Routes, Route } from 'react-router-dom'
import Navbar from './Components/Navbar/Navbar'
import Admin from './Components/Pages/Admin/Admin'
import Login from './Components/Pages/Login/Login'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute'

const theme = createTheme({
  palette: {
    primary: {
      main: '#6079ff',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f6fa',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
  },
})

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <>
                  <Navbar />
                  <Admin />
                </>
              </ProtectedRoute>
            }
          />
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
