const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
// To not get cors security errors , pass the following option to the io object
const {addUser, removeUser , getUser, getUsersInRoom} = require('./users.js')

const io = require('socket.io')(server,{
    cors:true,
    origin:"http://127.0.0.1:3000"
});

io.on('connection', (socket) => {
    console.log('user connected')

    socket.on('join',({name , room } , callback)=>{
        const {error , user } = addUser({id:socket.id,name, room});

        if(error) return callback(error)

        socket.emit('message', {user:'admin',text:`${user.name}, Welcome to the room ${user.room}`})
       
        socket.broadcast.to(user.room).emit('message',{user:'admin',text:`${user.name} has joined`})
        socket.join(user.room);

        io.to(user.room).emit('roomData',{room:user.room,users:getUsersInRoom(user.room)})
        
        callback();
    });

    socket.on('sendMessage',(message,callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('message' ,{user:user.name ,  text:message})
        io.to(user.room).emit('roomData' ,{room:user.room , users:getUsersInRoom(user.room)})

        callback();
    } )

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message',{user:'admin',text:`${user.name} has left`})
        }
    })
})


const port = 4000 || process.env.PORT
server.listen(port,()=>console.log("server up and running at "+port))


// const cors = require('cors');
// app.use(cors());

// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//   });