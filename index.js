const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const Joi = require('joi');

const schema = Joi.object({
    id: Joi.number()
        .min(1)
        .required(),
    name: Joi.string()
        .min(3)
        .max(30)
        .required(),
    lastName: Joi.string()
        .min(3)
        .max(30)
        .required(),
    age: Joi.number()
        .min(1)
        .required(),

});

const pathToDB = path.join(__dirname, '/users.json');
let userID = 2;
app.use(express.json());

app.get('/users', (req, res) => {
    fs.readFile(pathToDB, 'utf-8', (err, data) => {
        if (err) {
            console.log(`ERROR: ${err.message}`);
            res.status(404);
            res.send('Page not found');
        }

        if (data.length < 2) {
            console.log(`В файле users.json нет записей`);
            res.send('Список пользователей пуст, создайте пользователя');
            userID = 0;
            fs.writeFileS(pathToDB, "[]", (err, data) => {
                if (err) {
                    console.log(err.message);
                } else {
                    res.send(data);
                }
            });
        } else {
            console.log('Файл users.json успешно прочитан');
            data = JSON.parse(data)
            if (data.length < 2) {
                res.send('Пользователей нет')
            } else {
                let result = '';
                for (let i = 0; i < data.length; i++) {
                    let j = i + 1;
                    result += `<p><b>Пользователь ${j}:</b>  имя: ${data[i]["name"]} Фамилия: ${data[i]["lastName"]} id: ${data[i]["id"]} возраст ${data[i]["age"]}</p>`;
                }
                res.send(`${result}`);
            }
        }
    });
})

app.get('/users/:id', (req, res) => {
    fs.readFile(pathToDB, 'utf-8', (err, data) => {
        if (err) {
            console.log(err.message);
        } else {
            data = JSON.parse(data);
            let user = data.find((user) => user.id === Number(req.params.id));
            if (user) {
                res.send(JSON.stringify(user))
            } else {
                res.status(404);
                res.send('Такого пользователя нет');
            }
        }
    })
});

app.post('/users', (req, res) => {
    let resultValidetion = schema.validate(req.body);
    if (resultValidetion.error) {
        console.log(resultValidetion.error.details);
        return res.status(400).send(resultValidetion.error.details);
    }
    userID++;
    fs.readFile(pathToDB, 'utf-8', (err, data) => {
        if (err) {
            console.log(err.message);
        } else {
            console.log(' файл users.json успешно прочитан');
            data = JSON.parse(data);
            data.push({
                id: userID,
                ...req.body
            });
            data = JSON.stringify(data)
            fs.writeFileSync(pathToDB, data, (err, data) => {
                if (err) {
                    console.log(err.message);
                } else {
                    console.log('В файл users.json успешно записан новый пользователь');
                    res.send(data);
                }
            })
            res.send({ data });
        }
    })
});

app.put('/users/:id', (req, res) => {
    let resultValidetion = schema.validate(req.body);
    if (resultValidetion.error) {
        console.log(resultValidetion.error.details);
        return res.status(400).send(resultValidetion.error.details);
    }
    fs.readFile(pathToDB, 'utf-8', (err, data) => {
        if (err) {
            console.log('error read file');
            console.log(err.message);
        } else {
            let users = JSON.parse(data);
            let userIndex = users.findIndex(user => Number(user.id) === Number(req.params.id));

            if (userIndex != -1) {
                let user = users[userIndex];
                user.id = req.params.id;
                user.name = req.body.name;
                user.lastName = req.body.lastName;
                user.age = req.body.age;

                fs.writeFileSync(pathToDB, JSON.stringify(users, null, 2), (err) => {
                    if (err) {
                        console.log(err.message);
                    };
                });
                const userOut = user;
                console.log(`Пользователь с ID:  ${user.id} изменен`);
                res.send({ user });
            } else {
                console.log('Пользователь с ID=' + req.params.id + ' отсутствует в файле users.json');
            }
        };
    });
});



app.delete('/users/:id', (req, res) => {
    fs.readFile(pathToDB, 'utf-8', (err, data) => {
        if (err) {
            console.log(err.message);
        } else {
            let users = JSON.parse(data)
            let userIndex = users.findIndex(user => Number(user.id) === Number(req.params.id));
            if (userIndex != -1) {
                let user = users[userIndex];
                users.splice(userIndex, 1);
                fs.writeFileSync(pathToDB, JSON.stringify(users, null, 2), (err) => {
                    if (err) {
                        console.log(err.message);
                    };
                });
                res.send({ users });
            } else {
                console.log('Пользователь с ID=' + req.params.id + ' отсутствует в файле users.json');
                res.status(404).send('Пользователь с ID = ' + req.params.id + ' отсутствует в файле users.json')
            }
        }
    })
})


app.use((req, res) => {
    res.status(404);
    res.send('<h1>Page not found </h1> <p>Handler for nonexisten route</p>')
});
app.listen(3000, () => {
    console.log('Server running');
});