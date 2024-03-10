require('dotenv').config();
const express = require('express');
const mongoose = require('./service/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json());
app.use(express.json());

//Models
const User = require('./models/User');

//Index html
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

//Open route - Public Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
});
app.get('/auth/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'))
});
app.get('/auth/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'))
});

//Private Route
app.get('/user/:id', async (req, res) => {
    const { id } = req.params;
    const token = req.query.token;

    if (!token) {
        return res.status(401).json({ msg: 'Token não fornecido' });
    }

    try {
        const secret = process.env.SECRET;
        const decoded = jwt.verify(token, secret);

        // Verifique se o ID na URL corresponde ao ID no token
        if (decoded.id !== id) {
            return res.status(401).json({ msg: 'Token inválido para este usuário' });
        }

        // Redirecione para a página bem-vindo.html
        res.sendFile(path.join(__dirname, 'public', 'bem-vindo.html'));
    } catch (error) {
        console.log(error);
        res.status(400).json({ msg: 'Token inválido' });
    }
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
        return res.status(422).redirect('/auth/register?errmsg=Campos Obrigatórios' )
    };
    if (password !== confirmpassword) {
        return res.status(422).redirect('/auth/register?errmsg=As senhas não conferem')
    };
    //Check se já existe o usuario
    const userExists = await User.findOne({ email: email })
    if (userExists) {
        return res.redirect('/auth/register?errmsg=Usuário ja cadastrado')
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
        res.status(201).redirect('/auth/login?msg=Usuário cadastrado com sucesso, faça login')
    } catch (error) {
        console.log(error);
        res.status(500).redirect('/auth/register?errmsg=Erro servidor')
    }
});

//Login User
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    //Validações
    if (!email || !password) {
        return res.status(422).redirect('/auth/login?errmsg=Campos Obrigatórios');
    };
    //Check se já existe o usuario
    const user = await User.findOne({ email: email })
    if (!user) {
        return res.status(404).redirect('/auth/login?errmsg=Usuário não encontrado');
    };
    //Check usuario senha
    const checkPassword = await bcrypt.compare(password, user.password)
    if (!checkPassword) {
        return res.status(422).redirect('/auth/login?errmsg=Senha inválida');
    };
    //Logar
    try {
        const secret = process.env.SECRET;
        const token = jwt.sign({
            id: user._id,
        }, secret
        )
        res.status(200).redirect(`/user/${user._id}?token=${token}`)
    } catch (error) {
        console.log(error);
        res.status(500).redirect('/auth/login?errmsg=Erro servidor')
    }
});

app.listen(3000); // iniciar o servidor na porta 3000