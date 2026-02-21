import { Chip } from '@mui/material';

const statusColors = {
    // Vehicle statuses
    available: { bg: '#1B5E20', color: '#A5D6A7', label: 'Available' },
    on_trip: { bg: '#0D47A1', color: '#90CAF9', label: 'On Trip' },
    in_shop: { bg: '#E65100', color: '#FFB74D', label: 'In Shop' },
    retired: { bg: '#424242', color: '#BDBDBD', label: 'Retired' },
    // Driver statuses
    on_duty: { bg: '#1B5E20', color: '#A5D6A7', label: 'On Duty' },
    off_duty: { bg: '#37474F', color: '#B0BEC5', label: 'Off Duty' },
    suspended: { bg: '#B71C1C', color: '#EF9A9A', label: 'Suspended' },
    // Trip states
    draft: { bg: '#37474F', color: '#B0BEC5', label: 'Draft' },
    dispatched: { bg: '#0D47A1', color: '#90CAF9', label: 'Dispatched' },
    in_transit: { bg: '#6A1B9A', color: '#CE93D8', label: 'In Transit' },
    completed: { bg: '#1B5E20', color: '#A5D6A7', label: 'Completed' },
    cancelled: { bg: '#B71C1C', color: '#EF9A9A', label: 'Cancelled' },
};

export default function StatusChip({ status, size = 'small' }) {
    const config = statusColors[status] || { bg: '#333', color: '#999', label: status };
    return (
        <Chip
            label={config.label}
            size={size}
            sx={{
                backgroundColor: config.bg,
                color: config.color,
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                fontSize: '0.7rem',
            }}
        />
    );
}
