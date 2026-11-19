

//Configuring Express
const path = require('path');
const express = require('express');
const triviaRoutes = require('./routes/triviaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/TriviaBook-Node-Express', triviaRoutes);

//Unknown API routes
app.use('/TriviaBook-Node-Express', (req, res) =>{
    res.status(404).json({error: 'Endpoint not found'});
});


//Central Error handler
app.use((err, req, res, next) => {
    if(err.type === 'entity.parse.failed'){
        return res.status(400).json({error: 'Request Body is not valid'});
    }
    console.error(err);
    res.status(500).json({error: 'Internal serve error.'});
});

app.listen(PORT, () => {
    console.log(`Triviabook listening on port ${PORT}`);
});