//require('dotenv').config('/.env')
const express=require('express')
const app=express()
const ejs=require('ejs')
const path=require('path')
const expressLayout=require('express-ejs-layouts')
const PORT=process.env.PORT||3200;
const mongoose=require('mongoose')
const session=require('express-session')
const flash=require('express-flash')
const MongoDbStore = require('connect-mongo')(session)
const passport=require('passport')
const Emitter=require('events')
//DATABASE CONNECTION

mongoose.connect('your db url'
);
const connection=mongoose.connection;
connection.once('open',()=>{
console.log('Database connected...');    
}).catch(err=>{
    console.log('connection failed...');
});

// Session store
//var app = express();

  let mongoStore = new MongoDbStore({
     mongooseConnection: connection,
      collection: 'sessions'
 })
 //event emitter
const eventEmitter=new Emitter()
app.set('eventEmitter',eventEmitter)
//session config
app.use(session({
    secret:"thisismysecretkey",
    resave: false,
    store: mongoStore,
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60  * 24}//24hours
    
}))

//Passport config
const passportInit=require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())


// //ASSETS
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false}))
app.use(express.json())

//Global Middleware
app.use((req, res, next)=>{
   res.locals.session=req.session
   res.locals.user = req.user
   next()

})

//set template engine
app.use(expressLayout)
app.set('views',path.join(__dirname,'/resources/views'))
app.set('view engine','ejs')
require('./routes/web')(app)
app.use((req,res)=>{
    res.status(404).render('errors/404')
})

const server=app.listen(PORT,()=>{
    console.log(`Server listening on port ${PORT}`)
})

//socket
const io=require('socket.io')(server)
io.on('connection',(socket)=>{
    //Join
    console.log(socket.id)
    socket.on('join',(orderId)=>{
        console.log(orderId)
       socket.join(orderId)
    })
})

eventEmitter.on('orderUpdated',(data)=>{
  io.to(`order_${data.id}`).emit('orderUpdated',data)
})


eventEmitter.on('orderPlaced',(data)=>{
    io.to('adminRoom').emit('orderPlaced',data)
})
