const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

// 数据库连接
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'personal_website'
});

db.connect((err) => {
    if (err) throw err;
    console.log('数据库已连接');
});

// 处理反馈表单
app.post('/feedback', (req, res) => {
    const { name, email, feedback } = req.body;
    const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const location = '未知'; // 默认值

    const sql = 'INSERT INTO feedback (name, email, feedback, ip_address, location) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [name, email, feedback, ip_address, location], (err, result) => {
        if (err) throw err;
        res.send('反馈已提交！');
    });
});

// 处理建议表单
app.post('/suggestion', (req, res) => {
    const { suggestion } = req.body;
    const ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const location = '未知'; // 默认值

    const sql = 'INSERT INTO suggestions (suggestion, ip_address, location) VALUES (?, ?, ?)';
    db.query(sql, [suggestion, ip_address, location], (err, result) => {
        if (err) throw err;
        res.send('建议已提交！');
    });
});

// 管理员界面
app.use('/admin', (req, res, next) => {
    if (req.headers.authorization === 'Basic ' + Buffer.from('admin:password').toString('base64')) {
        next();
    } else {
        res.status(401).send('未授权');
    }
});

app.get('/admin/feedback', (req, res) => {
    const sql = 'SELECT * FROM feedback ORDER BY id DESC';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send(`<h1>反馈记录</h1><pre>${JSON.stringify(results, null, 2)}</pre>`);
    });
});

app.get('/admin/suggestions', (req, res) => {
    const sql = 'SELECT * FROM suggestions ORDER BY id DESC';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.send(`<h1>建议记录</h1><pre>${JSON.stringify(results, null, 2)}</pre>`);
    });
});

app.listen(port, () => {
    console.log(`服务器正在监听 ${port}`);
});
