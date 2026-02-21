import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
    Box, Paper, TextField, Button, Typography, Alert, InputAdornment,
    IconButton, CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', { email, password });
            login(data.token, data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: '#0A0E1A',
            background: 'radial-gradient(ellipse at 20% 50%, rgba(108,99,255,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(0,217,166,0.08) 0%, transparent 50%)',
        }}>
            <Paper sx={{
                p: 5, width: '100%', maxWidth: 420, borderRadius: 4,
                background: 'linear-gradient(145deg, rgba(17,24,39,0.95), rgba(17,24,39,0.8))',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(108,99,255,0.2)',
            }}>
                {/* Logo */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box sx={{
                        width: 56, height: 56, borderRadius: 3, mx: 'auto', mb: 2,
                        background: 'linear-gradient(135deg, #6C63FF, #00D9A6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 900, fontSize: '1.4rem', color: '#fff',
                        boxShadow: '0 8px 32px rgba(108,99,255,0.3)',
                    }}>
                        FF
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, backgroundImage: 'linear-gradient(135deg, #6C63FF, #00D9A6)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        FleetFlow
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        Fleet Management ERP
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        required sx={{ mb: 2 }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: 'text.secondary', fontSize: '1.1rem' }} /></InputAdornment> }}
                    />
                    <TextField fullWidth label="Password" type={showPassword ? 'text' : 'password'} value={password}
                        onChange={(e) => setPassword(e.target.value)} required sx={{ mb: 3 }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><Lock sx={{ color: 'text.secondary', fontSize: '1.1rem' }} /></InputAdornment>,
                            endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small"><Box sx={{ color: 'text.secondary' }}>{showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}</Box></IconButton></InputAdornment>,
                        }}
                    />
                    <Button fullWidth type="submit" variant="contained" size="large" disabled={loading}
                        sx={{
                            py: 1.5, fontWeight: 700, fontSize: '1rem', borderRadius: 2.5,
                            background: 'linear-gradient(135deg, #6C63FF, #8B83FF)',
                            '&:hover': { background: 'linear-gradient(135deg, #5A52E0, #7A72FF)' },
                        }}>
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                    </Button>
                </form>

                <Typography variant="body2" sx={{ textAlign: 'center', mt: 3, color: 'text.secondary', fontSize: '0.75rem' }}>
                    Demo: manager@fleet.io / admin123
                </Typography>
            </Paper>
        </Box>
    );
}
