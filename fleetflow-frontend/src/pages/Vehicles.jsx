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
import { Add, Edit, Delete, Refresh } from '@mui/icons-material';

const emptyVehicle = { name: '', licensePlate: '', maxCapacity: '', odometer: '0' };

export default function Vehicles() {
    const { hasRole } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(emptyVehicle);
    const [error, setError] = useState('');

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/vehicles');
            setVehicles(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
        socket.on('vehicleUpdate', fetchVehicles);
        return () => socket.off('vehicleUpdate', fetchVehicles);
    }, []);

    const openDialog = (vehicle = null) => {
        if (vehicle) {
            setEditId(vehicle.id);
            setForm({ name: vehicle.name, licensePlate: vehicle.licensePlate, maxCapacity: String(vehicle.maxCapacity), odometer: String(vehicle.odometer) });
        } else {
            setEditId(null);
            setForm(emptyVehicle);
        }
        setError('');
        setDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            if (editId) {
                await api.put(`/vehicles/${editId}`, {
                    name: form.name, licensePlate: form.licensePlate,
                    maxCapacity: parseFloat(form.maxCapacity), odometer: parseFloat(form.odometer),
                });
            } else {
                await api.post('/vehicles', form);
            }
            setDialogOpen(false);
            fetchVehicles();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this vehicle?')) return;
        try {
            await api.delete(`/vehicles/${id}`);
            fetchVehicles();
        } catch (err) {
            alert(err.response?.data?.error || 'Delete failed');
        }
    };

    const handleStatusToggle = async (vehicle, newStatus) => {
        try {
            await api.put(`/vehicles/${vehicle.id}`, { status: newStatus });
            fetchVehicles();
        } catch (err) {
            alert(err.response?.data?.error || 'Update failed');
        }
    };

    const columns = [
        { field: 'name', headerName: 'Vehicle Name', flex: 1, minWidth: 160 },
        { field: 'licensePlate', headerName: 'License Plate', width: 130 },
        { field: 'maxCapacity', headerName: 'Capacity (kg)', width: 130, type: 'number' },
        {
            field: 'odometer', headerName: 'Odometer (km)', width: 130, type: 'number',
            renderCell: (p) => p.value?.toLocaleString()
        },
        {
            field: 'status', headerName: 'Status', width: 130,
            renderCell: (p) => <StatusChip status={p.value} />
        },
        {
            field: '_count', headerName: 'Trips', width: 80,
            renderCell: (p) => p.row._count?.trips || 0
        },
        ...(hasRole('manager') ? [{
            field: 'actions', headerName: 'Actions', width: 150, sortable: false,
            renderCell: (p) => (
                <Box>
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => openDialog(p.row)}><Edit fontSize="small" /></IconButton></Tooltip>
                    {p.row.status !== 'retired' ? (
                        <Tooltip title="Retire"><IconButton size="small" onClick={() => handleStatusToggle(p.row, 'retired')} sx={{ color: '#FF5252' }}><Delete fontSize="small" /></IconButton></Tooltip>
                    ) : (
                        <Tooltip title="Reactivate"><IconButton size="small" onClick={() => handleStatusToggle(p.row, 'available')} sx={{ color: '#4CAF50' }}><Refresh fontSize="small" /></IconButton></Tooltip>
                    )}
                </Box>
            ),
        }] : []),
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4">Vehicle Registry</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {vehicles.length} vehicles in fleet
                    </Typography>
                </Box>
                {hasRole('manager') && (
                    <Button variant="contained" startIcon={<Add />} onClick={() => openDialog()}
                        sx={{ background: 'linear-gradient(135deg, #6C63FF, #8B83FF)' }}>
                        Add Vehicle
                    </Button>
                )}
            </Box>

            <Paper sx={{ borderRadius: 3 }}>
                <DataGrid
                    rows={vehicles} columns={columns} loading={loading}
                    pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    disableRowSelectionOnClick autoHeight
                    sx={{
                        border: 'none', borderRadius: 3,
                        '& .MuiDataGrid-columnHeaders': { bgcolor: 'rgba(108,99,255,0.08)' },
                        '& .MuiDataGrid-cell': { borderColor: 'rgba(255,255,255,0.04)' },
                        '& .MuiDataGrid-row:hover': { bgcolor: 'rgba(108,99,255,0.04)' },
                    }}
                />
            </Paper>

            {/* Add / Edit Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 3, bgcolor: 'background.paper' } }}>
                <DialogTitle>{editId ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
                <DialogContent>
                    {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth label="Vehicle Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="License Plate" value={form.licensePlate} onChange={(e) => setForm({ ...form, licensePlate: e.target.value })} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Max Capacity (kg)" type="number" value={form.maxCapacity} onChange={(e) => setForm({ ...form, maxCapacity: e.target.value })} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Odometer (km)" type="number" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: e.target.value })} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}
                        sx={{ background: 'linear-gradient(135deg, #6C63FF, #8B83FF)' }}>
                        {editId ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
