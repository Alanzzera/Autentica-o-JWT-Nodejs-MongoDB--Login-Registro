require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

//Config JSON response
app.use(express.json());

//Models
const User = require('./models/User');

//Open route - Public Route
app.get('/', (req, res) => {
    res.status(200).json({ msg: 'Bem vindo a API' })
});

//Private Route
app.get('/user/:id', checkToken, async (req, res) => {
    const id = req.params.id;
    const user = await User.findById(id, '-password');
    if (!user) {
        return res.status(404).json({ msg: 'Usuário não encontrado' })
    };
    res.status(200).json({ user })
});
function checkToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ msg: 'Acesso negado' })
    };
    try {
        const secret = process.env.SECRET;
        jwt.verify(token, secret);
        next()
    } catch (error) {
        res.status(400).json({msg: 'Token inválido'})
    }
};

//Registrar usuario
app.post('/auth/register', async (req, res) => {
    const { name, email, password, confirmpassword } = req.body
    //Validações
    if (!name, !email, !password, !confirmpassword) {
        return res.status(422).json({ msg: 'Campos Obrigatórios' })
    };
    if (password !== confirmpassword) {
        return res.status(422).json({ msg: 'As senhas não conferem' })
    };
    //Check se já existe o usuario
    const userExists = await User.findOne({ email: email })
    if (userExists) {
        return res.status(422).json({ msg: 'Usuário ja cadastrado' })
    };
    //Create password Hash
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    //Create user
    const user = new User({
        name,
        email,
        password: passwordHash
    });
    try {
        await user.save();
        res.status(201).json({ msg: 'Usuário criado com sucesso' })
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Erro servidor' })
    }
});

//Login User
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    //Validações
    if (!email, !password) {
        return res.status(422).json({ msg: 'Campos Obrigatórios' })
    };
    //Check se já existe o usuario
    const user = await User.findOne({ email: email })
    if (!user) {
        return res.status(404).json({ msg: 'Usuário não encontrado' })
    };
    //Check usuario senha
    const checkPassword = await bcrypt.compare(password, user.password)
    if (!checkPassword) {
        return res.status(422).json({ msg: 'Senha inválida' })
    };
    //Logar
    try {
        const secret = process.env.SECRET;
        const token = jwt.sign({
            id: user._id,
        }, secret
        )
        res.status(200).json({ msg: 'Autenticado', token })
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Erro servidor' })
    }
})

const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;

mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.8mnxtks.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
).then(() => {
    app.listen(3000);
    console.log("Conectado ao banco");
}).catch((err) => console.log(err)
);

