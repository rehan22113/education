//get modules of nodejs wher nodejs is backend!
const Express=require('express')
const App=Express()
const hbs=require('express-handlebars')
const bodyParser=require('body-parser')
const port=process.env.port||8080;
const Route = require('./Route/router')
const session = require('express-session')
//middleware use for as a middle man that means used to connect file together!

App.set('view engine','.hbs')
App.engine('.hbs',hbs.engine({defaultLayout:'main',extname:'.hbs'}))
App.use(bodyParser.json())
App.use(Express.static(__dirname + '/public'))
App.use(Express.urlencoded({extended:true}))
App.use(session({
	secret:'secret123321',
	saveUninitialized:true,
	resave:true
	}));

//connect mongoDb
const mongodb= require('./database/mongoDb')
mongodb();
//Routes
App.use("/",Route)

//server connection ip or either inf from google!
App.listen(port,()=>{
    console.log(`your port is runing at ${port}`)
    })
    