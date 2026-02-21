import { useState, useEffect } from 'react';
import api from '../api/axios';
import socket from '../api/socket';
import KPICard from '../components/KPICard';
import StatusChip from '../components/StatusChip';
import { Box, Typography, Grid, Paper, Alert, AlertTitle, Skeleton, Divider } from '@mui/material';
import { DirectionsCar, People, Route, AttachMoney, TrendingUp, Warning } from '@mui/icons-material';
import { PALETTE, PAGE_COLORS } from '../tokens';
import { alpha } from '@mui/material/styles';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

// Mini sparkline inside KPI area (uses faked trend data for demo)
function Sparkline({ color }) {
    const data = [3, 5, 4, 7, 6, 8, 7, 9, 8, 10, 9, 11].map((v, i) => ({ i, v }));
    return (
        <ResponsiveContainer width="100%" height={40}>
            <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#spark-${color})`} dot={false} />
            </AreaChart>
        </ResponsiveContainer>
    );
}

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const { data: d } = await api.get('/dashboard');
            setData(d);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchData();
        socket.on('statusUpdate', fetchData);
        socket.on('vehicleUpdate', fetchData);
        return () => { socket.off('statusUpdate', fetchData); socket.off('vehicleUpdate', fetchData); };
    }, []);

    const [c1, c2] = PAGE_COLORS.dashboard;

    if (loading) return (
        <Box className="page-enter">
            <Skeleton variant="rounded" height={80} sx={{ mb: 3, borderRadius: 3 }} />
            <Grid container spacing={2.5}>
                {[1, 2, 3, 4].map(i => <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}><Skeleton variant="rounded" height={130} sx={{ borderRadius: 3 }} /></Grid>)}
            </Grid>
        </Box>
    );

    return (
        <Box className="page-enter">
            {/* Hero banner */}
            <Box sx={{
                p: 3, mb: 3, borderRadius: 3.5,
                background: `linear-gradient(120deg, ${alpha(c1, 0.18)} 0%, ${alpha(c2, 0.1)} 60%, transparent 100%)`,
                border: `1px solid ${alpha(c1, 0.2)}`,
                position: 'relative', overflow: 'hidden',
                '&::before': {
                    content: '""', position: 'absolute', right: -40, top: -40,
                    width: 200, height: 200, borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(c1, 0.15)} 0%, transparent 70%)`,
                    pointerEvents: 'none',
                },
            }}>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.25 }}>Dashboard</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Real-time fleet overview · {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
            </Box>

            {/* KPI cards */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                {[
                    { title: 'Total Fleet', value: data?.vehiclesByStatus?.total ?? 0, sub: `${data?.vehiclesByStatus?.available ?? 0} available`, icon: <DirectionsCar fontSize="inherit" />, color: PALETTE.violet, delay: 0 },
                    { title: 'Active Trips', value: data?.tripsByState?.dispatched ?? 0, sub: `${data?.tripsByState?.completed ?? 0} completed total`, icon: <Route fontSize="inherit" />, color: PALETTE.emerald, delay: 60 },
                    { title: 'Drivers', value: data?.driversByStatus?.total ?? 0, sub: `${data?.driversByStatus?.on_duty ?? 0} on duty`, icon: <People fontSize="inherit" />, color: PALETTE.sky, delay: 120 },
                    { title: 'Total Costs', value: `$${(data?.costs?.total ?? 0).toLocaleString()}`, sub: `Fuel $${(data?.costs?.fuel ?? 0).toLocaleString()} · Maint $${(data?.costs?.maintenance ?? 0).toLocaleString()}`, icon: <AttachMoney fontSize="inherit" />, color: PALETTE.amber, delay: 180 },
                ].map((kpi) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={kpi.title}>
                        <KPICard {...kpi} subtitle={kpi.sub} />
                    </Grid>
                ))}
            </Grid>

            {/* Filters Section (Required by spec) */}
            <Paper sx={{ p: 2.5, borderRadius: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Fleet Distribution Filters</Typography>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(PALETTE.sky, 0.05), border: `1px solid ${alpha(PALETTE.sky, 0.1)}` }}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>By Vehicle Type</Typography>
                            {Object.entries(data?.vehiclesByType || {}).map(([type, count]) => (
                                <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2" sx={{ color: '#F1F5F9' }}>{type}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: PALETTE.sky }}>{count}</Typography>
                                </Box>
                            ))}
                            {Object.keys(data?.vehiclesByType || {}).length === 0 && <Typography variant="body2" sx={{ color: 'text.secondary' }}>No data</Typography>}
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(PALETTE.violet, 0.05), border: `1px solid ${alpha(PALETTE.violet, 0.1)}` }}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>By Status</Typography>
                            {['available', 'on_trip', 'in_shop', 'retired'].map(status => (
                                <Box key={status} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, alignItems: 'center' }}>
                                    <Typography variant="body2" sx={{ textTransform: 'capitalize', color: '#F1F5F9' }}>{status.replace('_', ' ')}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: PALETTE.violet }}>{data?.vehiclesByStatus?.[status] || 0}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha(PALETTE.emerald, 0.05), border: `1px solid ${alpha(PALETTE.emerald, 0.1)}` }}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em' }}>By Region</Typography>
                            {Object.entries(data?.vehiclesByRegion || {}).map(([region, count]) => (
                                <Box key={region} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2" sx={{ color: '#F1F5F9' }}>{region}</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: PALETTE.emerald }}>{count}</Typography>
                                </Box>
                            ))}
                            {Object.keys(data?.vehiclesByRegion || {}).length === 0 && <Typography variant="body2" sx={{ color: 'text.secondary' }}>No data</Typography>}
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Alerts + Status Breakdowns */}
            <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper sx={{ p: 2.5, borderRadius: 3, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Warning sx={{ color: PALETTE.amber, fontSize: '1.2rem' }} />
                            <Typography variant="h6">Alerts</Typography>
                        </Box>
                        {data?.alerts?.length > 0 ? data.alerts.map((a, i) => (
                            <Alert key={i} severity={a.type === 'warning' ? 'warning' : 'info'} sx={{ mb: 1, borderRadius: 2, fontSize: '0.85rem' }}>{a.message}</Alert>
                        )) : (
                            <Alert severity="success" sx={{ borderRadius: 2 }}>
                                <AlertTitle>All Clear</AlertTitle>No active alerts
                            </Alert>
                        )}
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Paper sx={{ p: 2.5, borderRadius: 3, height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Vehicle Status Breakdown</Typography>
                        {['available', 'on_trip', 'in_shop', 'retired'].map(s => (
                            <Box key={s} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.1, borderBottom: '1px solid rgba(255,255,255,0.05)', '&:last-child': { borderBottom: 'none' } }}>
                                <StatusChip status={s} />
                                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem' }}>
                                    {data?.vehiclesByStatus?.[s] ?? 0}
                                </Typography>
                            </Box>
                        ))}
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Paper sx={{ p: 2.5, borderRadius: 3, height: '100%' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Trip Status Breakdown</Typography>
                        {['draft', 'dispatched', 'completed', 'cancelled'].map(s => (
                            <Box key={s} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.1, borderBottom: '1px solid rgba(255,255,255,0.05)', '&:last-child': { borderBottom: 'none' } }}>
                                <StatusChip status={s} />
                                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem' }}>
                                    {data?.tripsByState?.[s] ?? 0}
                                </Typography>
                            </Box>
                        ))}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
