const userModel = require("../models/userModel");

async function register(req, res) {
  const { name, email, password, phone } = req.body;

  try {
    const existingUser = await userModel.findByEmail(email);

    if (existingUser) {
      return res.status(400).json({ error: "Email sudah terdaftar" });
    }

    const userId = await userModel.createUser(name, email, password, phone);

    res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      userId: userId,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Gagal mendaftar" });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  try {
    const user = await userModel.findByEmail(email);

    if (!user) {
      return res.status(401).json({ error: "Email atau password salah" });
    }

    const isPasswordValid = await userModel.validatePassword(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Email atau password salah" });
    }

    req.session.userId = user.id;
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    };

    res.json({
      success: true,
      message: "Login berhasil",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Gagal login" });
  }
}

function logout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Gagal logout" });
    }
    res.json({ success: true, message: "Logout berhasil" });
  });
}

function getAuthStatus(req, res) {
  if (req.session.user) {
    res.json({
      isAuthenticated: true,
      user: req.session.user,
    });
  } else {
    res.json({ isAuthenticated: false });
  }
}

module.exports = {
  register,
  login,
  logout,
  getAuthStatus,
};
