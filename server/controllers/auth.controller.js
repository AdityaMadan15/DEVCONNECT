import bcrypt from 'bcryptjs';
import axios from 'axios';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'name, email and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists',
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        error: 'JWT_SECRET is not configured',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = generateToken(user._id);
    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(201).json({
      success: true,
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error('registerUser error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Registration failed',
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'email and password are required',
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        error: 'JWT_SECRET is not configured',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    const token = generateToken(user._id);
    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(200).json({
      success: true,
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error('loginUser error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Login failed',
    });
  }
};

export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: req.user,
  });
};

export const githubAuth = (req, res) => {
  const CLIENT_ID = process.env.GITHUB_CLIENT_ID;

  if (!CLIENT_ID) {
    return res.status(500).json({
      success: false,
      error: 'GitHub Client ID not configured',
    });
  }

  const backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
  const redirectUri = `${backendUrl}/api/auth/github/callback`;
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=user:email&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return res.redirect(redirectUrl);
};

export const githubCallback = async (req, res) => {
  const code = req.query.code;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!code) {
    return res.redirect(`${frontendUrl}/login?oauth=error&reason=missing_code`);
  }

  try {
    if (!process.env.JWT_SECRET) {
      return res.redirect(`${frontendUrl}/login?oauth=error&reason=jwt_missing`);
    }

    const backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    const redirectUri = `${backendUrl}/api/auth/github/callback`;

    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      },
      {
        headers: { Accept: 'application/json' },
      }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) {
      return res.redirect(`${frontendUrl}/login?oauth=error&reason=token_exchange_failed`);
    }

    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const githubUser = userResponse.data;
    let email = githubUser.email;

    if (!email) {
      try {
        const emailsResponse = await axios.get('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const emailList = Array.isArray(emailsResponse.data) ? emailsResponse.data : [];
        const primary = emailList.find((item) => item.primary && item.verified) || emailList.find((item) => item.verified) || emailList[0];
        email = primary?.email;
      } catch {
        email = null;
      }
    }

    if (!email) {
      email = `${githubUser.login}@users.noreply.github.com`;
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      const hashedPassword = await bcrypt.hash(`${githubUser.id}-${Date.now()}`, 10);
      user = await User.create({
        name: githubUser.name || githubUser.login || 'GitHub User',
        username: githubUser.login || '',
        email: email.toLowerCase(),
        password: hashedPassword,
        avatar: githubUser.avatar_url || '',
      });
    } else {
      // Backfill missing fields for existing users
      let updated = false;
      if (!user.avatar && githubUser.avatar_url) {
        user.avatar = githubUser.avatar_url;
        updated = true;
      }
      if (!user.username && githubUser.login) {
        user.username = githubUser.login;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    }

    // Only sign userId — middleware fetches full user from DB on every request
    const token = generateToken(user._id);
    return res.redirect(`${frontendUrl}/auth/success?token=${encodeURIComponent(token)}`);
  } catch (error) {
    console.error('githubCallback error:', error);
    return res.redirect(`${frontendUrl}/login?oauth=error&reason=github_callback_failed`);
  }
};
