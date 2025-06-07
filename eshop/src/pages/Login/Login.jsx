// src/pages/Login/Login.jsx
import React, { useState } from 'react';
import {
  Avatar,
  Button,
  TextField,
  Link as MuiLink,
  Grid,
  Box,
  Typography,
  Container
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../../common/config';

export default function Login({ onLogin }) {
  const [form, setForm]   = useState({ username:'', password:'' });
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    setError('');
    try {
      const res = await axios.post(
        `${API_BASE}/auth/signin`,
        form,
        { validateStatus: () => true }
      );
      if (res.status === 200) {
        const token = res.headers['x-auth-token'];
        const role  = res.data.roles?.[0] || 'USER';
        // 1) Update App state & localStorage
        onLogin(token, role);
        // 2) Hard redirect the browser to "/"
        window.location.href = '/';
      } else {
        setError('Invalid email or password');
      }
    } catch {
      setError('Network error');
    }
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{ display:'flex', flexDirection:'column', minHeight:'100vh' }}
    >
      <Box sx={{ mt:8, display:'flex', flexDirection:'column', alignItems:'center' }}>
        <Avatar sx={{ m:1, bgcolor:'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        {error && (
          <Typography color="error" sx={{ mt:1 }}>
            {error}
          </Typography>
        )}
        <TextField
          margin="normal" required fullWidth
          label="Email Address *"
          value={form.username}
          onChange={e=>setForm(f=>({...f,username:e.target.value}))}
        />
        <TextField
          margin="normal" required fullWidth
          label="Password *"
          type="password"
          value={form.password}
          onChange={e=>setForm(f=>({...f,password:e.target.value}))}
        />
        <Button
          fullWidth
          variant="contained"
          sx={{ mt:3, mb:2 }}
          onClick={handleSignIn}
        >
          SIGN IN
        </Button>
        <Grid container justifyContent="flex-end">
          <Grid item>
            <MuiLink component={RouterLink} to="/signup" variant="body2">
              Don't have an account? Sign Up
            </MuiLink>
          </Grid>
        </Grid>
      </Box>

      {/* Footer */}
      <Box sx={{ mt:'auto', py:2, textAlign:'center' }}>
        <Typography variant="body2" color="text.secondary">
          Copyright ©{' '}
          <MuiLink component={RouterLink} to="/" underline="hover">
            upGrad
          </MuiLink>{' '}
          2021.
        </Typography>
      </Box>
    </Container>
  );
}
