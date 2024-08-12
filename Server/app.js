const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const cors = require("cors")
app.use(cors());
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const JWT_SECRET = "jhfksdfhkjsd23847485()sdsds!?[]kjfdsfjdsfh"

const mongoUrl ="mongodb+srv://vansh:vansh@cluster0.6fvr6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

mongoose
.connect(mongoUrl, {
    useNewUrlParser: true,
})
.then(()=>{
    console.log("Connected to database");
})
.catch((e) => console.log(e));

require("./userDetails")

const User = mongoose.model("UserInfo");

app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const encryptedPassword = await bcrypt.hash(password, 10);
        const oldUser = await User.findOne({ email });

        if (oldUser) {
            return res.send({ error: "user exists" });
        }

        await User.create({
            username,
            email,
            password: encryptedPassword,
        });
        res.send({ status: "ok" });
    } catch (error) {
        res.send({ status: "error" });
    }
})

app.post("/login-user", async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.json({ error: "user not found" });
    }
    if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ email: user.email }, JWT_SECRET);

        if (res.status(201)) {
            return res.json({
                status: "ok",
                data: {
                    token: token,
                    username: user.username,  // Send the username along with the token
                },
            });
        } else {
            return res.json({ error: "error" });
        }
    }
    res.json({ status: "error", error: "invalid password" });
});


app.post("/userData", async(req,res )=>{
    const {token}= req.body;
    try{
        const user = jwt.verify(token, JWT_SECRET);
        const useremail = user.email
         user.findOne({email:useremail})
         .then((data)=>{
            res.send({ status:"ok", data:data});
         })
         .catch((error) => {
            res.send({ status: "error", error: error });
         });
    }catch (error){ }
})

app.listen(5000, ()=>{
    console.log("server started");
});