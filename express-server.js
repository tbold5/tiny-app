const express = require('express');
const app = express();
const PORT = 8080; //default port
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt')
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
    name: 'session',
    keys: ['DS_@;Hbcwt&;5<!']
}));
app.set("view engine", "ejs");

const users = { 
    "userRandomID": {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "1"
    },
   "user2RandomID": {
      id: "user2RandomID", 
      email: "user2@example.com", 
      password: "dishwasher-funk"
    }
  }

function generateRandomString() {
     return Math.random().toString(36).substr(2,6);
    };

function findEmail(input) {
    for (var user in users) {
        if (users[user].email === input) {
            return true
        }
    } 
    return false;
};

function findPassword(input) {
    for (var user in users) {
        if (users[user].password === input) {
            return true
        }
    } 
    return false;
};

function checkUsers(input) {
    for (var user in urlDatabase) {
        if (urlDatabase[user].userID === input) {
            return true;
        }
    } 
    return false;
};

function getURLByUserID (userID) {
    let result = {};
    for (var url in urlDatabase) {
        if (urlDatabase[url].userID === userID) {
            result[url] = urlDatabase[url]
        }
        console.log(urlDatabase[url].userID, userID )
    }
    console.log('result;',result)
    return result;
}

var urlDatabase = {
    "b2xVn2": {
        userID: "userRandomID",
        URL: "http://www.lighthouselabs.ca"},
    "9sm5xK": {
        userID: "user2RandomID",
        URL: "http://www.google.com"}
};

app.get("/", (req, res) => {
    res.send("Hello Trae!");
});

app.get("/urls/new", (req, res) => {
    if (!req.session['user_id']) {
        res.redirect('/login')
    } else {
        res.render("urls_new")
    }
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
    if (req.session['user_id']) {
        let templateVars = { 
            urls: getURLByUserID(req.session['user_id']),
            user: users[req.session["user_id"]]
        };
        res.render("urls_index", templateVars);
    } else {
        res.redirect('/login')
    }

});

app.get("/urls/:id", (req, res) => {
    let templateVars = {
        shortURL: req.params.id,
        userID: req.session["user_id"],
        user: users["user_id"]
    };
    res.render("urls_show", templateVars);
}); 

app.post("/urls", (req, res) => {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = req.body.longURL
    
    urlDatabase[shortURL] = {
        userID: req.session["user_id"],
        URL: req.body.longURL
    }
    res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
    let shortURL = req.params.shortURL;
    let longURL = urlDatabase[shortURL];
    if (longURL === undefined){
        res.status(404).send('Not Found')
    } else {
        res.redirect(longURL)
    }
});

app.post("/urls/:id/delete", (req, res) => {
    if (checkUsers(req.session['user_id'])) {
        delete urlDatabase[req.params.id];
        res.redirect("/urls");
    } else {
        res.redirect('/urls')
    }
});

app.post("/urls/:id", (req, res) => {
    let updatedURL = req.body.longURL;
    let shortURL = req.params.id;
    urlDatabase[shortURL] = updatedURL;
    res.redirect("/urls");
});

app.post("/login", (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    if (findEmail(email) && findPassword(password)) {
        for (var user in users){
        if (users[user].email === req.body.email) {
            req.session['user_id'] = user
        } 
    }
        res.redirect("/urls")
    } else {
    res.redirect("/login");
    }
});

app.post("/logout", (req,res) => {
    req.session = null
    res.redirect("/login");
});

app.get("/register", (req, res) => {
    var user_id = req.session["user_id"];
    let templateVars = {
        shortURL: req.params.id,
        userID: user_id,
        user: users[user_id]
    };
    
    res.render('urls_register', templateVars)
});

app.post("/register", (req, res) => {
    let userID = generateRandomString()
    let email = req.body.email;
    let password = req.body.password;
    let hashedPassword = bcrypt.hashSync(password, 10);
    if (email === "" || password === "") {
        res.status(400).send('Registration Empty')
        return;
    } else if (findEmail(email)) {
        res.status(400).send('Email already exists')
    } else {
        users[userID] = {                   
            id: userID,
            email: email,
            password: hashedPassword,
        }
        console.log(users);
        req.session["user_id"] = userID
        res.redirect("/urls")
    }
});

app.get("/login", (req, res) => {
    res.render('urls_login');
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});