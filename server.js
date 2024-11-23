const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');
require('dotenv').config(); 

const app = express();
app.use(bodyParser.json());
app.use(cors());


const SECRET_KEY = process.env.SECRET_KEY || 'miClaveSuperSecreta';

// API 1: Registro de Usuario
app.post('/registro', async (req, res) => {
    const { nombre, correo, password } = req.body;

    // Verificación básica de campos
    if (!nombre || !correo || !password) {
        return res.status(400).json({ error: 'Faltan datos: nombre, correo y contraseña son necesarios' });
    }

    try {
        // Hasheo de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Inserción del usuario en la base de datos
        const result = await db.query(
            'INSERT INTO usuarios (nombre, correo, contrasena) VALUES ($1, $2, $3) RETURNING idusuario',
            [nombre, correo, hashedPassword]
        );

        res.status(201).json({ mensaje: 'Usuario creado', usuarioId: result.rows[0].idusuario });
    } catch (err) {
        console.error('Error al registrar usuario:', err);
        res.status(500).send('Error al registrar usuario');
    }
});

// API 2: Login de Usuario
app.post('/login', async (req, res) => {
    const { correo, password } = req.body; 

    // Verificación de campos
    if (!correo || !password) {
        return res.status(400).json({ error: 'Correo y contraseña son necesarios' });
    }

    try {
        // Consulta de usuario en la base de datos
        const result = await db.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
        const usuario = result.rows[0];

        if (!usuario) {
            console.log('Usuario no encontrado');
            return res.status(404).send('Usuario no encontrado');
        }

        // Comparación de la contraseña
        const isMatch = await bcrypt.compare(password, usuario.contrasena); // Asegúrate que el nombre de la columna en la DB sea 'contrasena'
        if (!isMatch) {
            console.log('Contraseña incorrecta');
            return res.status(401).send('Contraseña incorrecta');
        }

        // Generación de token JWT
        const token = jwt.sign({ id: usuario.idusuario, correo: usuario.correo }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });

    } catch (err) {
        console.error('Error en el login:', err);
        res.status(500).send('Error en el servidor');
    }
});

// Iniciar servidor en el puerto 3000
app.listen(3000, () => {
    console.log('API corriendo en http://localhost:3000');
});
