require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('./service/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());

//Models
const User = require('./models/User');

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
app.get('/user/:id', checkToken, async (req, res) => {
    const { id } = req.params;

    try {
        const token = req.cookies.token;
        const secret = process.env.SECRET;
        const decoded = jwt.verify(token, secret);

        // Verifique se o ID na URL corresponde ao ID no token
        if (decoded.id !== id) {
            return res.status(401).redirect('/auth/login');
        }

        // Redirecione para a página bem-vindo.html
        res.status(200).sendFile(path.join(__dirname, 'public', 'bem-vindo.html'));
    } catch (error) {
        res.status(400).redirect('/auth/login');
    }
});

// Rota para obter a lista de usuários
app.get('/users', checkToken, async (req, res) => {
    try {
        // Busca todos os usuários do banco de dados
        const users = await User.find({}, 'name email');

        // Envie a lista de usuários como resposta
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
});

function checkToken(req, res, next) {
    const token = req.cookies.token; // Extrair o token do cookie

    if (!token) {
        return res.status(401).redirect('/auth/login'); // Redirecionar para a página de login se não houver token
    }

    try {
        const secret = process.env.SECRET;
        const decoded = jwt.verify(token, secret);
        
        req.user = decoded; // Adicionar o usuário decodificado ao objeto de requisição para acesso posterior
        next(); // Chamar next() para prosseguir com o fluxo da requisição
    } catch (error) {
        console.log(error);
        res.status(401).json({msg: 'Erro ao se conectar com o servidor'});
    }
};

//Registrar usuario
app.post('/auth/register', async (req, res) => {
    const { name, email, password, confirmpassword } = req.body;
    if (!name, !email, !password, !confirmpassword) {
        return res.status(422).json({ msg: 'Campos não preenchidos' });
    };
    if (password !== confirmpassword) {
        return res.status(422).json({ msg: 'Confirmação de senha incorreta' });
    };
    //Check se já existe o usuario
    const userExists = await User.findOne({ email: email })
    if (userExists) {
        return res.json({ msg: 'Usuário ja cadastrado' });
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
        res.status(201).json({ id: user._id });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Erro ao se conectar com o servidor' });
    }
});

//Login User
app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    //Validações
    if (!email || !password) {
        return res.status(422).json({ msg: 'Informe email e senha' });
    }
    try {
        //Check se já existe o usuário
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ msg: 'Usuário não encontrado' });
        }
        //Check usuário senha
        const checkPassword = await bcrypt.compare(password, user.password);
        if (!checkPassword) {
            return res.status(422).json({ msg: 'Senha incorreta' });
        }
        //Logar
        const secret = process.env.SECRET;
        const token = jwt.sign({ id: user._id }, secret);
        res.status(200).json({ id: user._id, token: token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Erro ao se conectar com o servidor' });
    }
});

app.listen({
    host: '0.0.0.0',
    port: process.env.PORT ?? 3000
})