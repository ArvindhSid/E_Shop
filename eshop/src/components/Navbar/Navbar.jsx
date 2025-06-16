import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Link } from 'react-router-dom';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  maxWidth: 400,
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  paddingLeft: `calc(1em + ${theme.spacing(4)})`,
}));

const Navbar = ({ token, onLogout, isAdmin, q, setQ, handleSearchKey }) => {
  return (
    <AppBar position="static" sx={{ backgroundColor: '#3f51b5' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Logo and title */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ShoppingCartIcon sx={{ color: 'white', mr: 1 }} />
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
            upGrad E-Shop
          </Typography>
        </Box>

        {/* Centered Search */}
        {token && (
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <Search>
              <SearchIconWrapper>
                <SearchIcon sx={{ color: 'white' }} />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Search…"
                value={q}
                onChange={e => setQ(e.target.value)}
                onKeyDown={handleSearchKey}
              />
            </Search>
          </Box>
        )}

        {/* Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {token ? (
            <>
              <Button component={Link} to="/" sx={{ color: 'white', textTransform: 'none' }}>
                Home
              </Button>
              {isAdmin && (
                <Button component={Link} to="/add-product" sx={{ color: 'white', textTransform: 'none' }}>
                  Add Product
                </Button>
              )}
              <Button
                onClick={onLogout}
                variant="contained"
                color="secondary"
                sx={{ textTransform: 'uppercase', ml: 1 }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button component={Link} to="/login" sx={{ color: 'white', textTransform: 'none', mr: 2 }}>
                Login
              </Button>
              <Button component={Link} to="/signup" sx={{ color: 'white', textTransform: 'none' }}>
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
