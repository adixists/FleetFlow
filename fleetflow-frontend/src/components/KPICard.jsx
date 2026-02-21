import { Paper, Box, Typography } from '@mui/material';

export default function KPICard({ title, value, subtitle, icon, color = '#6C63FF' }) {
    return (
        <Paper
            sx={{
                p: 2.5,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${color}15, ${color}08)`,
                border: `1px solid ${color}30`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 24px ${color}20`,
                },
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, fontWeight: 500 }}>
                        {title}
                    </Typography>
                    <Typography variant="h4" sx={{ color, fontWeight: 800, lineHeight: 1.1 }}>
                        {value}
                    </Typography>
                    {subtitle && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                {icon && (
                    <Box sx={{ color, opacity: 0.7, fontSize: '2.5rem', display: 'flex' }}>
                        {icon}
                    </Box>
                )}
            </Box>
        </Paper>
    );
}
