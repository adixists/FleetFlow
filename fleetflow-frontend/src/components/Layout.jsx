import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
    AppBar, Toolbar, Typography, IconButton, Avatar, Menu, MenuItem,
    Divider, useMediaQuery, useTheme,
} from '@mui/material';
import {
    Dashboard as DashboardIcon, DirectionsCar, Route, Build,
    LocalGasStation, People, Analytics, Logout, Menu as MenuIcon,
} from '@mui/icons-material';

const drawerWidth = 260;

const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Vehicles', icon: <DirectionsCar />, path: '/vehicles' },
    { text: 'Trips', icon: <Route />, path: '/trips', roles: ['manager', 'dispatcher'] },
    { text: 'Maintenance', icon: <Build />, path: '/maintenance' },
    { text: 'Fuel', icon: <LocalGasStation />, path: '/fuel' },
    { text: 'Drivers', icon: <People />, path: '/drivers' },
    { text: 'Analytics', icon: <Analytics />, path: '/analytics', roles: ['manager', 'analyst'] },
];

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const filteredNav = navItems.filter(
        item => !item.roles || item.roles.includes(user?.role)
    );

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                    sx={{
                        width: 36, height: 36, borderRadius: 2,
                        background: 'linear-gradient(135deg, #6C63FF, #00D9A6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '1rem', color: '#fff',
                    }}
                >
                    FF
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, backgroundImage: 'linear-gradient(135deg, #6C63FF, #00D9A6)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    FleetFlow
                </Typography>
            </Box>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
            <List sx={{ flex: 1, px: 1.5, py: 2 }}>
                {filteredNav.map((item) => (
                    <ListItemButton
                        key={item.path}
                        onClick={() => { navigate(item.path); setMobileOpen(false); }}
                        selected={location.pathname === item.path}
                        sx={{
                            borderRadius: 2, mb: 0.5, py: 1.2,
                            '&.Mui-selected': {
                                backgroundColor: 'rgba(108, 99, 255, 0.15)',
                                '&:hover': { backgroundColor: 'rgba(108, 99, 255, 0.2)' },
                            },
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 40, color: location.pathname === item.path ? '#6C63FF' : 'text.secondary' }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: location.pathname === item.path ? 600 : 400, fontSize: '0.9rem' }} />
                    </ListItemButton>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            {/* Sidebar */}
            {isMobile ? (
                <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }}
                    sx={{ '& .MuiDrawer-paper': { width: drawerWidth, bgcolor: 'background.paper', borderRight: '1px solid rgba(255,255,255,0.06)' } }}>
                    {drawer}
                </Drawer>
            ) : (
                <Drawer variant="permanent"
                    sx={{ width: drawerWidth, flexShrink: 0, '& .MuiDrawer-paper': { width: drawerWidth, bgcolor: 'background.paper', borderRight: '1px solid rgba(255,255,255,0.06)' } }}>
                    {drawer}
                </Drawer>
            )}

            {/* Main content */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <Toolbar>
                        {isMobile && (
                            <IconButton color="inherit" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
                                <MenuIcon />
                            </IconButton>
                        )}
                        <Box sx={{ flex: 1 }} />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {user?.email}
                            </Typography>
                            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                                <Avatar sx={{ width: 34, height: 34, bgcolor: '#6C63FF', fontSize: '0.85rem', fontWeight: 700 }}>
                                    {user?.email?.[0]?.toUpperCase()}
                                </Avatar>
                            </IconButton>
                            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                                <MenuItem disabled>
                                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>Role: {user?.role?.replace('_', ' ')}</Typography>
                                </MenuItem>
                                <Divider />
                                <MenuItem onClick={() => { logout(); navigate('/login'); }}>
                                    <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                                    Logout
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Toolbar>
                </AppBar>

                <Box sx={{ flex: 1, p: { xs: 2, md: 3 }, overflow: 'auto' }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}
