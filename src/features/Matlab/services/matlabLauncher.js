const { exec } = require('child_process');
const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Ruta absoluta al script MATLAB
const matlabScript = path.join(__dirname, '../scripts/abrir_fuzzy.m');

// Ruta al ejecutable de MATLAB 
// compus del labo "C:\Program Files\MATLAB\R2023b\bin\matlab.exe"
const matlabExe = '"C:\\Program Files\\MATLAB\\R2023b\\bin\\matlab.exe"';

app.get('/abrir-fuzzy', (req, res) => {
    exec(`${matlabExe} -r "run('${matlabScript}');"`, (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error al abrir MATLAB Fuzzy Designer');
        }
        console.log(stdout);
        res.send('MATLAB Fuzzy Designer abierto correctamente');
    });
});

app.listen(port, () => {
    console.log(`Servidor MATLAB Launcher corriendo en http://localhost:${port}`);
});
