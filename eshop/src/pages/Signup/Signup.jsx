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
import { Link as RouterLink, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../../common/config';

export default function Signup() {
  const [form, setForm]         = useState({
    firstName:'', lastName:'', email:'', password:'', confirm:'', contactNumber:''
  });
  const [error, setError]       = useState('');
  const [message, setMessage]   = useState('');
  const [redirect, setRedirect] = useState(false);
  const nav = useNavigate();

  const handleSignUp = async () => {
    setError('');
    setMessage('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    try {
      const payload = {
        firstName: form.firstName,
        lastName:  form.lastName,
        email:     form.email,
        password:  form.password,
        contactNumber: form.contactNumber
      };
      const res = await axios.post(`${API_BASE}/auth/signup`, payload);
      if (res.status === 201) {
        setMessage('Signup successful! Redirecting to login…');
        setTimeout(() => setRedirect(true), 1000);
      } else {
        setError('Signup failed');
      }
    } catch {
      setError('Signup failed');
    }
  };

  if (redirect) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Avatar sx={{ m:1, bgcolor:'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">Sign up</Typography>
        {error   && <Typography color="error"   sx={{ mt:1 }}>{error}</Typography>}
        {message && <Typography color="primary" sx={{ mt:1 }}>{message}</Typography>}

        <TextField
          margin="normal"
          required fullWidth
          label="First Name *"
          value={form.firstName}
          onChange={e=>setForm(f=>({...f,firstName:e.target.value}))}
        />
        <TextField
          margin="normal"
          required fullWidth
          label="Last Name *"
          value={form.lastName}
          onChange={e=>setForm(f=>({...f,lastName:e.target.value}))}
        />
        <TextField
          margin="normal"
          required fullWidth
          label="Email Address *"
          value={form.email}
          onChange={e=>setForm(f=>({...f,email:e.target.value}))}
        />
        <TextField
          margin="normal"
          required fullWidth
          label="Password *"
          type="password"
          value={form.password}
          onChange={e=>setForm(f=>({...f,password:e.target.value}))}
        />
        <TextField
          margin="normal"
          required fullWidth
          label="Confirm Password *"
          type="password"
          value={form.confirm}
          onChange={e=>setForm(f=>({...f,confirm:e.target.value}))}
        />
        <TextField
          margin="normal"
          required fullWidth
          label="Contact Number *"
          value={form.contactNumber}
          onChange={e=>setForm(f=>({...f,contactNumber:e.target.value}))}
        />

        <Button
          fullWidth
          variant="contained"
          sx={{ mt:3, mb:2 }}
          onClick={handleSignUp}
        >
          SIGN UP
        </Button>

        <Grid container justifyContent="flex-end">
          <Grid item>
            <MuiLink component={RouterLink} to="/login" variant="body2">
              Already have an account? Sign in
            </MuiLink>
          </Grid>
        </Grid>
      </Box>

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
