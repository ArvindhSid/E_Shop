// src/components/Navbar/Navbar.jsx
import React, { useState } from 'react';
import { AppBar, Toolbar, Button, InputBase, Box, Typography } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon       from '@mui/icons-material/Search';
import './Navbar.css';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': { backgroundColor: alpha(theme.palette.common.white, 0.25) },
  width: '40%',
  marginLeft: theme.spacing(2),
  marginRight: theme.spacing(2),
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    width: '100%',
  },
}));

export default function Navbar({ token, isAdmin, onLogout }) {
  const nav = useNavigate();
  const [q, setQ] = useState('');

  const handleSearchKey = e => {
    if (e.key === 'Enter') nav(`/?q=${encodeURIComponent(q)}`);
  };

  return (
    <AppBar position="static" sx={{ bgcolor: '#3f51b5' }}>
      <Toolbar sx={{ justifyContent: 'space-between', minHeight:64 }}>
        {/* Logo */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => nav('/')}
        >
          <ShoppingCartIcon sx={{ color:'white', mr:1 }} />
          <Typography variant="h6" sx={{ color:'white', fontWeight:'bold' }}>
            upGrad E-Shop
          </Typography>
        </Box>

        {/* If logged out: login/signup */}
        {!token ? (
          <Box>
            <Button
              component={Link} to="/login"
              sx={{ color:'white', textTransform:'none', mr:2 }}
            >
              Login
            </Button>
            <Button
              component={Link} to="/signup"
              sx={{ color:'white', textTransform:'none' }}
            >
              Sign Up
            </Button>
          </Box>
        ) : (
          /* If logged in: search + links + logout */
          <Box sx={{ display:'flex', alignItems:'center' }}>
            <Search>
              <SearchIconWrapper>
                <SearchIcon sx={{ color:'white' }}/>
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                value={q}
                onChange={e => setQ(e.target.value)}
                onKeyDown={handleSearchKey}
              />
            </Search>
            <Button
              component={Link} to="/"
              color="inherit"
              sx={{ textTransform:'none', mx:1 }}
            >
              Home
            </Button>
            {isAdmin && (
              <Button
                component={Link} to="/add-product"
                color="inherit"
                sx={{ textTransform:'none', mx:1 }}
              >
                Add Product
              </Button>
            )}
            <Button
              onClick={onLogout}
              variant="contained"
              color="secondary"
              sx={{ textTransform:'uppercase', ml:1 }}
            >
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
