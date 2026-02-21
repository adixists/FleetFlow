import { Paper, Box, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

export default function KPICard({ title, value, subtitle, icon, color = '#7C6FFF', delay = 0 }) {
    return (
        <Paper
            className="card-enter"
            sx={{
                p: 3,
                borderRadius: 3.5,
                position: 'relative',
                overflow: 'hidden',
                animationDelay: `${delay}ms`,
                background: `linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)`,
                border: `1px solid ${alpha(color, 0.22)}`,
                // Glow effect bottom
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0, left: '10%',
                    width: '80%', height: '1px',
                    background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                },
                // Background orb
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '-30%', right: '-10%',
                    width: '140px', height: '140px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(color, 0.12)} 0%, transparent 70%)`,
                    pointerEvents: 'none',
                },
                transition: 'transform 0.22s ease, box-shadow 0.22s ease',
                '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: `0 12px 32px ${alpha(color, 0.22)}`,
                },
            }}
        >
            <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.75, display: 'block' }}>
                        {title}
                    </Typography>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 800,
                            lineHeight: 1.1,
                            mb: subtitle ? 0.75 : 0,
                            backgroundImage: `linear-gradient(135deg, ${color}, ${color}99)`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        {value}
                    </Typography>
                    {subtitle && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.78rem' }}>
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                {icon && (
                    <Box sx={{
                        color,
                        opacity: 0.6,
                        fontSize: '2.2rem',
                        display: 'flex',
                        mt: 0.5,
                        filter: `drop-shadow(0 0 8px ${alpha(color, 0.5)})`,
                    }}>
                        {icon}
                    </Box>
                )}
            </Box>
        </Paper>
    );
}
