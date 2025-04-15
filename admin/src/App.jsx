import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import Navbar from './Components/Navbar/Navbar'
import Admin from './Components/Pages/Admin/Admin'

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div>
        <Navbar/>
        <Admin/>
      </div>
    </ThemeProvider>
  )
}

export default App
