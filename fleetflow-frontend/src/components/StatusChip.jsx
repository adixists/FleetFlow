import { Chip, Box } from '@mui/material';
import { STATUS_COLORS } from '../tokens';

export default function StatusChip({ status, size = 'small' }) {
    const c = STATUS_COLORS[status] || { bg: 'rgba(148,163,184,0.1)', color: '#94A3B8', dot: '#94A3B8' };
    const label = status?.replace('_', ' ') || status;

    return (
        <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: 0.75,
            px: 1.25, py: 0.45,
            borderRadius: '6px',
            backgroundColor: c.bg,
            border: `1px solid ${c.color}22`,
            fontSize: size === 'small' ? '0.68rem' : '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
            color: c.color,
            whiteSpace: 'nowrap',
            userSelect: 'none',
        }}>
            <Box sx={{
                width: 6, height: 6, borderRadius: '50%',
                backgroundColor: c.dot,
                boxShadow: `0 0 6px ${c.dot}`,
                flexShrink: 0,
            }} />
            {label}
        </Box>
    );
}
