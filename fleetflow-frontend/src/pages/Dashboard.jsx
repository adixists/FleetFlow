import { useState, useEffect } from 'react';
import api from '../api/axios';
import socket from '../api/socket';
import KPICard from '../components/KPICard';
import StatusChip from '../components/StatusChip';
import {
    Box, Typography, Grid, Paper, Alert, AlertTitle, Skeleton,
} from '@mui/material';
import {
    DirectionsCar, People, Route, Warning, AttachMoney,
    LocalGasStation,
} from '@mui/icons-material';

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const { data: d } = await api.get('/dashboard');
            setData(d);
        } catch (err) {
            console.error('Dashboard fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        socket.on('statusUpdate', fetchData);
        socket.on('vehicleUpdate', fetchData);
        return () => {
            socket.off('statusUpdate', fetchData);
            socket.off('vehicleUpdate', fetchData);
        };
    }, []);

    if (loading) {
        return (
            <Box>
                <Typography variant="h4" sx={{ mb: 3 }}>Dashboard</Typography>
                <Grid container spacing={2.5}>
                    {[1, 2, 3, 4].map(i => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                            <Skeleton variant="rounded" height={120} sx={{ borderRadius: 3 }} />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 0.5 }}>Dashboard</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                Real-time fleet overview
            </Typography>

            {/* KPI Cards */}
            <Grid container spacing={2.5} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <KPICard title="Total Fleet" value={data?.vehiclesByStatus?.total || 0}
                        subtitle={`${data?.vehiclesByStatus?.available || 0} available`}
                        icon={<DirectionsCar fontSize="inherit" />} color="#6C63FF" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <KPICard title="Active Trips" value={data?.tripsByState?.dispatched || 0}
                        subtitle={`${data?.tripsByState?.completed || 0} completed`}
                        icon={<Route fontSize="inherit" />} color="#00D9A6" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <KPICard title="Drivers" value={data?.driversByStatus?.total || 0}
                        subtitle={`${data?.driversByStatus?.on_duty || 0} on duty`}
                        icon={<People fontSize="inherit" />} color="#29B6F6" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <KPICard title="Total Costs" value={`$${(data?.costs?.total || 0).toLocaleString()}`}
                        subtitle={`Fuel: $${(data?.costs?.fuel || 0).toLocaleString()}`}
                        icon={<AttachMoney fontSize="inherit" />} color="#FFB74D" />
                </Grid>
            </Grid>

            {/* Alerts & Status Breakdown */}
            <Grid container spacing={2.5}>
                {/* Alerts */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 2.5, borderRadius: 3, height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Warning sx={{ color: '#FFB74D' }} /> Alerts
                        </Typography>
                        {data?.alerts?.length > 0 ? (
                            data.alerts.map((alert, i) => (
                                <Alert key={i} severity={alert.type === 'warning' ? 'warning' : 'info'} sx={{ mb: 1, borderRadius: 2 }}>
                                    {alert.message}
                                </Alert>
                            ))
                        ) : (
                            <Alert severity="success" sx={{ borderRadius: 2 }}>
                                <AlertTitle>All Clear</AlertTitle>
                                No active alerts
                            </Alert>
                        )}
                    </Paper>
                </Grid>

                {/* Vehicle Status Breakdown */}
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Paper sx={{ p: 2.5, borderRadius: 3, height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Vehicle Status</Typography>
                        {['available', 'on_trip', 'in_shop', 'retired'].map(status => (
                            <Box key={status} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <StatusChip status={status} />
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    {data?.vehiclesByStatus?.[status] || 0}
                                </Typography>
                            </Box>
                        ))}
                    </Paper>
                </Grid>

                {/* Trip State Breakdown */}
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Paper sx={{ p: 2.5, borderRadius: 3, height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Trip Status</Typography>
                        {['draft', 'dispatched', 'completed', 'cancelled'].map(state => (
                            <Box key={state} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                <StatusChip status={state} />
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    {data?.tripsByState?.[state] || 0}
                                </Typography>
                            </Box>
                        ))}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
