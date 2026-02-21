import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatusChip from '../components/StatusChip';
import {
    Box, Typography, Button, Paper, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Grid, IconButton, Tooltip, LinearProgress,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Edit, Delete } from '@mui/icons-material';

const emptyDriver = { name: '', licenseExpiry: '', safetyScore: '100' };

export default function Drivers() {
    const { hasRole } = useAuth();
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState(emptyDriver);

    const fetchDrivers = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/drivers');
            setDrivers(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDrivers(); }, []);

    const openDialog = (driver = null) => {
        if (driver) {
            setEditId(driver.id);
            setForm({
                name: driver.name,
                licenseExpiry: new Date(driver.licenseExpiry).toISOString().split('T')[0],
                safetyScore: String(driver.safetyScore),
            });
        } else {
            setEditId(null);
            setForm(emptyDriver);
        }
        setDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            const data = { name: form.name, licenseExpiry: form.licenseExpiry, safetyScore: form.safetyScore };
            if (editId) {
                await api.put(`/drivers/${editId}`, data);
            } else {
                await api.post('/drivers', data);
            }
            setDialogOpen(false);
            fetchDrivers();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to save');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this driver?')) return;
        try {
            await api.delete(`/drivers/${id}`);
            fetchDrivers();
        } catch (err) {
            alert(err.response?.data?.error || 'Delete failed');
        }
    };

    const columns = [
        { field: 'name', headerName: 'Driver Name', flex: 1, minWidth: 160 },
        {
            field: 'status', headerName: 'Status', width: 130,
            renderCell: (p) => <StatusChip status={p.value} />
        },
        {
            field: 'licenseExpiry', headerName: 'License Expiry', width: 140,
            renderCell: (p) => {
                const date = new Date(p.value);
                const expired = date < new Date();
                return <Typography variant="body2" sx={{ color: expired ? '#FF5252' : 'text.primary', fontWeight: expired ? 700 : 400 }}>{date.toLocaleDateString()}</Typography>;
            }
        },
        {
            field: 'safetyScore', headerName: 'Safety Score', width: 180,
            renderCell: (p) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <LinearProgress variant="determinate" value={p.value}
                        sx={{
                            flex: 1, height: 8, borderRadius: 4,
                            bgcolor: 'rgba(255,255,255,0.08)',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: p.value >= 90 ? '#4CAF50' : p.value >= 70 ? '#FFB74D' : '#FF5252',
                                borderRadius: 4,
                            },
                        }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 28 }}>{p.value}</Typography>
                </Box>
            )
        },
        {
            field: 'completionRate', headerName: 'Completion', width: 110,
            renderCell: (p) => `${p.value || 0}%`
        },
        { field: 'totalTrips', headerName: 'Trips', width: 80, type: 'number' },
        ...(hasRole('manager') ? [{
            field: 'actions', headerName: 'Actions', width: 120, sortable: false,
            renderCell: (p) => (
                <Box>
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => openDialog(p.row)}><Edit fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(p.row.id)} sx={{ color: '#FF5252' }}><Delete fontSize="small" /></IconButton></Tooltip>
                </Box>
            ),
        }] : []),
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4">Driver Profiles</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {drivers.length} registered drivers
                    </Typography>
                </Box>
                {hasRole('manager') && (
                    <Button variant="contained" startIcon={<Add />} onClick={() => openDialog()}
                        sx={{ background: 'linear-gradient(135deg, #29B6F6, #4FC3F7)' }}>
                        Add Driver
                    </Button>
                )}
            </Box>

            <Paper sx={{ borderRadius: 3 }}>
                <DataGrid
                    rows={drivers} columns={columns} loading={loading}
                    pageSizeOptions={[10, 25]} initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    disableRowSelectionOnClick autoHeight
                    sx={{
                        border: 'none', borderRadius: 3,
                        '& .MuiDataGrid-columnHeaders': { bgcolor: 'rgba(41,182,246,0.08)' },
                        '& .MuiDataGrid-cell': { borderColor: 'rgba(255,255,255,0.04)' },
                    }}
                />
            </Paper>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth
                PaperProps={{ sx: { borderRadius: 3, bgcolor: 'background.paper' } }}>
                <DialogTitle>{editId ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth label="Driver Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="License Expiry" type="date" value={form.licenseExpiry}
                                onChange={(e) => setForm({ ...form, licenseExpiry: e.target.value })}
                                InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField fullWidth label="Safety Score" type="number" value={form.safetyScore}
                                onChange={(e) => setForm({ ...form, safetyScore: e.target.value })}
                                inputProps={{ min: 0, max: 100 }} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}
                        sx={{ background: 'linear-gradient(135deg, #29B6F6, #4FC3F7)' }}>
                        {editId ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
