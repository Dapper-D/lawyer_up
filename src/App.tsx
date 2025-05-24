import React, { useState } from 'react';
import {
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Typography,
  Container,
  Paper,
  Tab,
  Tabs,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ChatIcon from '@mui/icons-material/Chat';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import GavelIcon from '@mui/icons-material/Gavel';
import Chat from './components/Chat';
import Text from './components/Text';
import { FileProvider } from './contexts/FileContext';

// Create a dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#64FFDA', // Vibrant cyan
    },
    secondary: {
      main: '#FF79C6', // Bright pink
    },
    background: {
      default: '#1a1b26',
      paper: '#1a1b26',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: "'Montserrat', 'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
});

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  minHeight: '100vh',
  padding: theme.spacing(3),
  background: `
    linear-gradient(135deg, 
      rgba(26, 27, 38, 0.95) 0%,
      rgba(40, 42, 54, 0.95) 100%
    ),
    radial-gradient(
      circle at top right,
      rgba(100, 255, 218, 0.1) 0%,
      rgba(41, 61, 255, 0.1) 50%,
      rgba(255, 121, 198, 0.1) 100%
    ),
    linear-gradient(
      45deg,
      rgba(41, 61, 255, 0.1) 0%,
      rgba(255, 121, 198, 0.1) 100%
    )
  `,
  backgroundBlendMode: 'normal, screen, overlay',
  boxShadow: 'none',
  borderRadius: 0,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: 'linear-gradient(90deg, #64FFDA, #293DFF, #FF79C6)',
  },
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: '3px',
    borderRadius: '3px',
  },
  '& .MuiTab-root': {
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(100, 255, 218, 0.05)',
    },
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 0,
  [theme.breakpoints.up('sm')]: {
    minWidth: 0,
  },
  fontWeight: theme.typography.fontWeightRegular,
  marginRight: theme.spacing(1),
  color: theme.palette.text.secondary,
  '&.Mui-selected': {
    color: theme.palette.primary.main,
  },
  padding: '12px 24px',
  borderRadius: '8px',
}));

const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(2, 0),
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '80%',
    height: '1px',
    background: 'linear-gradient(90deg, transparent, rgba(100, 255, 218, 0.3), transparent)',
  },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  '& .MuiSvgIcon-root': {
    fontSize: '2.5rem',
    color: theme.palette.primary.main,
    filter: 'drop-shadow(0 0 8px rgba(100, 255, 218, 0.3))',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'scale(1.1)',
      filter: 'drop-shadow(0 0 12px rgba(100, 255, 218, 0.5))',
    },
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

function App() {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <FileProvider>
        <StyledPaper>
          <Container maxWidth="lg">
            <HeaderContainer>
              <LogoContainer>
                <GavelIcon />
                <Typography
                  variant="h4"
                  component="div"
                  sx={{
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    fontFamily: "'Montserrat', sans-serif",
                    '& .lawyer': {
                      color: '#64FFDA',
                      textShadow: '0 0 20px rgba(100, 255, 218, 0.3)',
                    },
                    '& .up': {
                      color: '#FF79C6',
                      textShadow: '0 0 20px rgba(255, 121, 198, 0.3)',
                    },
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      '& .lawyer': {
                        textShadow: '0 0 25px rgba(100, 255, 218, 0.5)',
                      },
                      '& .up': {
                        textShadow: '0 0 25px rgba(255, 121, 198, 0.5)',
                      },
                    },
                  }}
                >
                  <span className="lawyer">LAWYER</span>{' '}
                  <span className="up">UP</span>
                </Typography>
              </LogoContainer>
              <StyledTabs
                value={value}
                onChange={handleChange}
                aria-label="AI Assistant Tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                <StyledTab icon={<TextFieldsIcon />} label="Text & Image Analysis" />
                <StyledTab icon={<ChatIcon />} label="Chat" />
              </StyledTabs>
            </HeaderContainer>

            <TabPanel value={value} index={0}>
              <Text />
            </TabPanel>

            <TabPanel value={value} index={1}>
              <Chat />
            </TabPanel>
          </Container>
        </StyledPaper>
      </FileProvider>
    </ThemeProvider>
  );
}

export default App; 