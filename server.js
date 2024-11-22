const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const SECRET_KEY = process.env.SECRET_KEY || 'miClaveSuperSecreta';

// API 1: Registro de Usuario
app.post('/registro', async (req, res) => {
    const { nombre, correo, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            'INSERT INTO usuario (nombre, correo, password) VALUES ($1, $2, $3) RETURNING idusuario',
            [nombre, correo, hashedPassword]
        );
        res.status(201).json({ mensaje: 'Usuario creado', usuarioId: result.rows[0].idusuario });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al registrar usuario');
    }
});

// API 2: Login de Usuario
app.post('/login', async (req, res) => {
    const { correo, password } = req.body; // Cambié 'contrasena' a 'password'
    try {
        const result = await db.query('SELECT * FROM usuario WHERE correo = $1', [correo]);
        const usuario = result.rows[0];

        if (!usuario) return res.status(404).send('Usuario no encontrado');

        const isMatch = await bcrypt.compare(password, usuario.password); // Cambié 'contrasena' a 'password'
        if (!isMatch) return res.status(401).send('Contraseña incorrecta');

        const token = jwt.sign({ id: usuario.idusuario, correo: usuario.correo }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});

app.listen(3000, () => {
    console.log('API corriendo en http://localhost:3000');
});
