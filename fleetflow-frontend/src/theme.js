import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#6C63FF',
            light: '#8B83FF',
            dark: '#4A42CC',
        },
        secondary: {
            main: '#00D9A6',
            light: '#33E3BD',
            dark: '#00A87F',
        },
        background: {
            default: '#0A0E1A',
            paper: '#111827',
        },
        error: {
            main: '#FF5252',
        },
        warning: {
            main: '#FFB74D',
        },
        success: {
            main: '#4CAF50',
        },
        info: {
            main: '#29B6F6',
        },
        text: {
            primary: '#E8EAED',
            secondary: '#9CA3AF',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: { fontWeight: 700, letterSpacing: '-0.02em' },
        h5: { fontWeight: 600, letterSpacing: '-0.01em' },
        h6: { fontWeight: 600 },
        body1: { fontSize: '0.938rem' },
        body2: { fontSize: '0.813rem' },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 10,
                    padding: '8px 20px',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    border: '1px solid rgba(255,255,255,0.06)',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    fontSize: '0.75rem',
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
                size: 'small',
            },
        },
    },
});

export default theme;
