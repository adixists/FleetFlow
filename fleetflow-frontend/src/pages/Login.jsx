import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Box, Paper, Typography, TextField, Button, Alert, CircularProgress, InputAdornment, IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { PALETTE } from '../tokens';
import { alpha } from '@mui/material/styles';
import api from '../api/axios';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            login(data.token, data.user);
            navigate('/dashboard');
        }
        catch (err) { setError(err.response?.data?.error || 'Login failed. Check your credentials.'); }
        finally { setLoading(false); }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden', p: 2,
            background: '#080C18',
        }}>
            {/* Animated gradient orbs */}
            {[
                { top: '-15%', left: '-10%', color: PALETTE.violet, size: 500 },
                { bottom: '-20%', right: '-5%', color: PALETTE.emerald, size: 420 },
                { top: '40%', left: '60%', color: PALETTE.sky, size: 300 },
            ].map((orb, i) => (
                <Box key={i} sx={{
                    position: 'absolute', borderRadius: '50%', pointerEvents: 'none',
                    width: orb.size, height: orb.size,
                    top: orb.top, bottom: orb.bottom, left: orb.left, right: orb.right,
                    background: `radial-gradient(circle, ${alpha(orb.color, 0.18)} 0%, transparent 70%)`,
                    filter: 'blur(40px)',
                    animation: `fadeIn 1s ease both ${i * 0.15}s`,
                }} />
            ))}

            {/* Grid dots overlay */}
            <Box sx={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                backgroundImage: `radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)`,
                backgroundSize: '36px 36px',
            }} />

            <Paper sx={{
                p: { xs: 3, sm: 4.5 },
                width: '100%', maxWidth: 440,
                position: 'relative', zIndex: 1,
                background: 'rgba(15,22,41,0.85)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 4,
                boxShadow: `0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)`,
                animation: 'fadeSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
            }}>
                {/* Logo */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                    <Box sx={{
                        width: 42, height: 42, borderRadius: 2.5,
                        background: 'linear-gradient(135deg, #7C6FFF 0%, #07EDB2 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, fontSize: '1.05rem', color: '#fff',
                        boxShadow: '0 4px 16px rgba(124,111,255,0.5)',
                    }}>FF</Box>
                    <Box>
                        <Typography sx={{
                            fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.1,
                            backgroundImage: 'linear-gradient(135deg, #7C6FFF, #07EDB2)',
                            backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        }}>FleetFlow</Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', letterSpacing: '0.1em', textTransform: 'uppercase' }}>ERP Platform</Typography>
                    </Box>
                </Box>

                <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>Welcome back</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>Sign in to access your fleet dashboard</Typography>

                {error && <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>{error}</Alert>}

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        fullWidth label="Email address" type="email" value={email}
                        onChange={e => setEmail(e.target.value)} required autoFocus autoComplete="email"
                    />
                    <TextField
                        fullWidth label="Password" type={showPwd ? 'text' : 'password'} value={password}
                        onChange={e => setPassword(e.target.value)} required autoComplete="current-password"
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setShowPwd(!showPwd)} edge="end" sx={{ color: 'text.secondary' }}>
                                        {showPwd ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button type="submit" fullWidth variant="contained" size="large" disabled={loading}
                        sx={{
                            mt: 0.5,
                            height: 48,
                            fontWeight: 700,
                            fontSize: '0.9375rem',
                            background: 'linear-gradient(135deg, #7C6FFF 0%, #4F46E5 100%)',
                            boxShadow: '0 6px 20px rgba(124,111,255,0.4)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #9D93FF 0%, #7C6FFF 100%)',
                                boxShadow: '0 8px 28px rgba(124,111,255,0.5)',
                            },
                        }}>
                        {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Sign In'}
                    </Button>
                </Box>

                {/* Demo hint */}
                <Box sx={{ mt: 3.5, p: 2, borderRadius: 2, background: 'rgba(124,111,255,0.06)', border: '1px solid rgba(124,111,255,0.12)' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.78rem', mb: 0.5, fontWeight: 600 }}>Demo accounts (password: admin123)</Typography>
                    {[['manager@fleet.io', 'Full access'], ['dispatcher@fleet.io', 'Trips only']].map(([e, r]) => (
                        <Box key={e} sx={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', py: 0.25 }} onClick={() => { setEmail(e); setPassword('admin123'); }}>
                            <Typography sx={{ color: PALETTE.violet, fontSize: '0.78rem', textDecoration: 'underline', textDecorationStyle: 'dotted' }}>{e}</Typography>
                            <Typography sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>{r}</Typography>
                        </Box>
                    ))}
                </Box>
            </Paper>
        </Box>
    );
}
