import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusChip from '../components/StatusChip';
import {
    Box, Typography, Button, Paper, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Grid, MenuItem, Alert, LinearProgress,
    IconButton, Tooltip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Edit, Delete, People } from '@mui/icons-material';
import { PALETTE, PAGE_COLORS } from '../tokens';
import { alpha } from '@mui/material/styles';

const empty = { name: '', licenseExpiry: '', safetyScore: '100' };

export default function Drivers() {
    const { hasRole } = useAuth();
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(empty);

    const fetch = async () => {
        setLoading(true);
        try { const { data } = await api.get('/drivers'); setDrivers(data); }
        catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { fetch(); }, []);

    const openDialog = (d = null) => {
        setEditId(d?.id ?? null);
        setForm(d ? { name: d.name, licenseExpiry: new Date(d.licenseExpiry).toISOString().split('T')[0], safetyScore: String(d.safetyScore) } : empty);
        setOpen(true);
    };

    const handleSave = async () => {
        try {
            const body = { name: form.name, licenseExpiry: form.licenseExpiry, safetyScore: form.safetyScore };
            if (editId) await api.put(`/drivers/${editId}`, body);
            else await api.post('/drivers', body);
            setOpen(false); fetch();
        } catch (e) { alert(e.response?.data?.error || 'Failed'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this driver?')) return;
        try { await api.delete(`/drivers/${id}`); fetch(); }
        catch (e) { alert(e.response?.data?.error || 'Delete failed'); }
    };

    const [c1, c2] = PAGE_COLORS.drivers;

    const scoreColor = (s) => s >= 90 ? PALETTE.emerald : s >= 70 ? PALETTE.amber : PALETTE.rose;

    const columns = [
        { field: 'name', headerName: 'Driver', flex: 1, minWidth: 150, renderCell: p => <Typography sx={{ fontWeight: 600 }}>{p.value}</Typography> },
        { field: 'status', headerName: 'Status', width: 130, renderCell: p => <StatusChip status={p.value} /> },
        {
            field: 'licenseExpiry', headerName: 'License Expiry', width: 145,
            renderCell: p => {
                const d = new Date(p.value), expired = d < new Date();
                return <Typography sx={{ fontWeight: expired ? 700 : 400, color: expired ? PALETTE.rose : 'text.primary', fontSize: '0.875rem' }}>
                    {d.toLocaleDateString()}{expired ? ' ⚠' : ''}
                </Typography>;
            }
        },
        {
            field: 'safetyScore', headerName: 'Safety Score', width: 190,
            renderCell: p => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, width: '100%' }}>
                    <LinearProgress variant="determinate" value={p.value}
                        sx={{
                            flex: 1, height: 7, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.07)',
                            '& .MuiLinearProgress-bar': { borderRadius: 4, backgroundImage: `linear-gradient(90deg, ${scoreColor(p.value)}, ${scoreColor(p.value)}cc)` }
                        }} />
                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', minWidth: 28, color: scoreColor(p.value) }}>{p.value}</Typography>
                </Box>
            ),
        },
        { field: 'completionRate', headerName: 'Completion', width: 110, renderCell: p => <Typography sx={{ fontWeight: 700, color: PALETTE.emerald }}>{p.value ?? 0}%</Typography> },
        { field: 'totalTrips', headerName: 'Trips', width: 80, renderCell: p => <Typography sx={{ fontWeight: 600 }}>{p.value ?? 0}</Typography> },
        ...(hasRole('manager') ? [{
            field: 'actions', headerName: 'Actions', width: 100, sortable: false,
            renderCell: p => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => openDialog(p.row)} sx={{ color: PALETTE.sky }}><Edit sx={{ fontSize: '1rem' }} /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(p.row.id)} sx={{ color: PALETTE.rose }}><Delete sx={{ fontSize: '1rem' }} /></IconButton></Tooltip>
                </Box>
            ),
        }] : []),
    ];

    return (
        <Box className="page-enter">
            <Box sx={{
                p: 3, mb: 3, borderRadius: 3.5,
                background: `linear-gradient(120deg, ${alpha(c1, 0.18)} 0%, ${alpha(c2, 0.1)} 60%, transparent 100%)`,
                border: `1px solid ${alpha(c1, 0.2)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap',
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <People sx={{ color: c1, fontSize: '1.8rem', filter: `drop-shadow(0 0 8px ${alpha(c1, 0.5)})` }} />
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.1 }}>Driver Profiles</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{drivers.length} registered drivers</Typography>
                    </Box>
                </Box>
                {hasRole('manager') && (
                    <Button variant="contained" startIcon={<Add />} onClick={() => openDialog()}
                        sx={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>
                        Add Driver
                    </Button>
                )}
            </Box>

            <Paper sx={{ borderRadius: 3 }}>
                <DataGrid rows={drivers} columns={columns} loading={loading}
                    pageSizeOptions={[10, 25]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    disableRowSelectionOnClick autoHeight sx={{ border: 'none', borderRadius: 3 }} />
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editId ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid size={{ xs: 12 }}><TextField fullWidth label="Driver Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="License Expiry" type="date" value={form.licenseExpiry} onChange={e => setForm({ ...form, licenseExpiry: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Safety Score (0–100)" type="number" value={form.safetyScore} onChange={e => setForm({ ...form, safetyScore: e.target.value })} inputProps={{ min: 0, max: 100 }} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} sx={{ background: `linear-gradient(135deg, ${c1}, ${c2})` }}>{editId ? 'Update' : 'Create'}</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
