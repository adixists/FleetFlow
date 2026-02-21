import { useState, useEffect } from 'react';
import api from '../api/axios';
import socket from '../api/socket';
import { useAuth } from '../context/AuthContext';
import StatusChip from '../components/StatusChip';
import {
    Box, Typography, Button, Paper, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Grid, IconButton, Tooltip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Edit, Delete, Refresh, DirectionsCar } from '@mui/icons-material';
import { PALETTE, PAGE_COLORS } from '../tokens';
import { alpha } from '@mui/material/styles';

const empty = { name: '', licensePlate: '', maxCapacity: '', odometer: '0' };

export default function Vehicles() {
    const { hasRole } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(empty);
    const [error, setError] = useState('');

    const fetchVehicles = async () => {
        setLoading(true);
        try { const { data } = await api.get('/vehicles'); setVehicles(data); }
        catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchVehicles();
        socket.on('vehicleUpdate', fetchVehicles);
        return () => socket.off('vehicleUpdate', fetchVehicles);
    }, []);

    const openDialog = (v = null) => {
        setEditId(v?.id ?? null);
        setForm(v ? { name: v.name, licensePlate: v.licensePlate, maxCapacity: String(v.maxCapacity), odometer: String(v.odometer) } : empty);
        setError(''); setOpen(true);
    };

    const handleSave = async () => {
        try {
            const body = { name: form.name, licensePlate: form.licensePlate, maxCapacity: parseFloat(form.maxCapacity), odometer: parseFloat(form.odometer) };
            if (editId) await api.put(`/vehicles/${editId}`, body);
            else await api.post('/vehicles', body);
            setOpen(false); fetchVehicles();
        } catch (e) { setError(e.response?.data?.error || 'Failed to save'); }
    };

    const handleStatus = async (v, s) => {
        try { await api.put(`/vehicles/${v.id}`, { status: s }); fetchVehicles(); }
        catch (e) { alert(e.response?.data?.error || 'Update failed'); }
    };

    const [c1, c2] = PAGE_COLORS.vehicles;

    const columns = [
        { field: 'name', headerName: 'Vehicle Name', flex: 1, minWidth: 160 },
        { field: 'licensePlate', headerName: 'Plate', width: 120, renderCell: p => <Typography sx={{ fontFamily: 'monospace', fontSize: '0.85rem', color: PALETTE.sky }}>{p.value}</Typography> },
        { field: 'maxCapacity', headerName: 'Capacity', width: 120, renderCell: p => `${p.value?.toLocaleString()} kg` },
        { field: 'odometer', headerName: 'Odometer', width: 130, renderCell: p => `${p.value?.toLocaleString()} km` },
        { field: 'status', headerName: 'Status', width: 140, renderCell: p => <StatusChip status={p.value} /> },
        { field: '_count', headerName: 'Trips', width: 80, renderCell: p => <Typography sx={{ fontWeight: 700 }}>{p.row._count?.trips ?? 0}</Typography> },
        ...(hasRole('manager') ? [{
            field: 'actions', headerName: 'Actions', width: 100, sortable: false,
            renderCell: p => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => openDialog(p.row)} sx={{ color: PALETTE.sky }}><Edit sx={{ fontSize: '1rem' }} /></IconButton></Tooltip>
                    {p.row.status !== 'retired'
                        ? <Tooltip title="Retire"><IconButton size="small" onClick={() => handleStatus(p.row, 'retired')} sx={{ color: PALETTE.rose }}><Delete sx={{ fontSize: '1rem' }} /></IconButton></Tooltip>
                        : <Tooltip title="Reactivate"><IconButton size="small" onClick={() => handleStatus(p.row, 'available')} sx={{ color: PALETTE.emerald }}><Refresh sx={{ fontSize: '1rem' }} /></IconButton></Tooltip>
                    }
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
                    <DirectionsCar sx={{ color: c1, fontSize: '1.8rem', filter: `drop-shadow(0 0 8px ${alpha(c1, 0.5)})` }} />
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.1 }}>Vehicle Registry</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{vehicles.length} vehicles in fleet</Typography>
                    </Box>
                </Box>
                {hasRole('manager') && (
                    <Button variant="contained" startIcon={<Add />} onClick={() => openDialog()}
                        sx={{ background: `linear-gradient(135deg, ${c1}, ${alpha(c1, 0.7)})`, '&:hover': { background: `linear-gradient(135deg, ${alpha(c1, 0.9)}, ${alpha(c2, 0.8)})` } }}>
                        Add Vehicle
                    </Button>
                )}
            </Box>

            <Paper sx={{ borderRadius: 3 }}>
                <DataGrid rows={vehicles} columns={columns} loading={loading}
                    pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    disableRowSelectionOnClick autoHeight
                    sx={{ border: 'none', borderRadius: 3 }} />
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editId ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
                <DialogContent>
                    {error && <Typography color="error" sx={{ mb: 2, fontSize: '0.85rem' }}>{error}</Typography>}
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid size={{ xs: 12 }}><TextField fullWidth label="Vehicle Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="License Plate" value={form.licensePlate} onChange={e => setForm({ ...form, licensePlate: e.target.value })} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Max Capacity (kg)" type="number" value={form.maxCapacity} onChange={e => setForm({ ...form, maxCapacity: e.target.value })} /></Grid>
                        <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Odometer (km)" type="number" value={form.odometer} onChange={e => setForm({ ...form, odometer: e.target.value })} /></Grid>
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
