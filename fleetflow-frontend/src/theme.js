import { createTheme, alpha } from '@mui/material/styles';
import { PALETTE } from './tokens';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: PALETTE.violet, light: '#9D93FF', dark: '#5A50D4' },
        secondary: { main: PALETTE.emerald, light: '#3CF5C5', dark: '#059669' },
        warning: { main: PALETTE.amber },
        error: { main: PALETTE.rose },
        info: { main: PALETTE.sky },
        background: {
            default: '#080C18',
            paper: '#0F1629',
        },
        text: {
            primary: '#F1F5F9',
            secondary: '#7E8FA8',
            disabled: '#3D4F69',
        },
        divider: 'rgba(255,255,255,0.05)',
    },

    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h3: { fontWeight: 800, letterSpacing: '-0.03em' },
        h4: { fontWeight: 800, letterSpacing: '-0.025em' },
        h5: { fontWeight: 700, letterSpacing: '-0.015em' },
        h6: { fontWeight: 700, letterSpacing: '-0.01em' },
        subtitle1: { fontWeight: 600, lineHeight: 1.4 },
        body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
        body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
        caption: { fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' },
    },

    shape: { borderRadius: 14 },

    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    background: 'radial-gradient(ellipse 80% 50% at 20% 0%, rgba(124,111,255,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(7,237,178,0.05) 0%, transparent 50%), #080C18',
                    backgroundAttachment: 'fixed',
                },
            },
        },

        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: '#0F1629',
                    border: '1px solid rgba(255,255,255,0.065)',
                },
            },
        },

        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 10,
                    padding: '8px 22px',
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease',
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': { boxShadow: `0 6px 20px ${alpha(PALETTE.violet, 0.35)}` },
                },
            },
        },

        MuiTextField: {
            defaultProps: { variant: 'outlined', size: 'small' },
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 10,
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                        '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                        '&.Mui-focused fieldset': { borderColor: PALETTE.violet, borderWidth: 1.5 },
                    },
                },
            },
        },

        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    borderRadius: 6,
                },
            },
        },

        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    transition: 'all 0.18s ease',
                },
            },
        },

        MuiDataGrid: {
            styleOverrides: {
                root: {
                    border: 'none',
                    '& .MuiDataGrid-columnHeader': {
                        backgroundColor: 'rgba(124,111,255,0.08)',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        color: '#7E8FA8',
                    },
                    '& .MuiDataGrid-cell': {
                        borderColor: 'rgba(255,255,255,0.04)',
                        fontSize: '0.875rem',
                    },
                    '& .MuiDataGrid-row': {
                        transition: 'background 0.15s',
                        '&:hover': { backgroundColor: 'rgba(124,111,255,0.07)' },
                    },
                    '& .MuiDataGrid-row:nth-of-type(even)': {
                        backgroundColor: 'rgba(255,255,255,0.02)',
                    },
                    '& .MuiDataGrid-footerContainer': {
                        borderColor: 'rgba(255,255,255,0.06)',
                    },
                },
            },
        },

        MuiAlert: {
            styleOverrides: {
                root: { borderRadius: 10 },
            },
        },

        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundImage: 'none',
                    backgroundColor: '#0F1629',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 18,
                },
            },
        },

        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: '#1E2D4A',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    fontSize: '0.78rem',
                },
            },
        },
    },
});

export default theme;
