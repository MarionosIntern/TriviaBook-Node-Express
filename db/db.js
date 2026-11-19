
//Creates a single shared PostgreSQL connection using DATABASE_URL
require('dotenv').config();
const {Pool} = require('pg');

if(!process.env.DATABASE_URL){
    console.error('DATABASE URL is not set. Check .env file.');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'false' ? false : {rejectUnauthorized: false}
});

module.exports= pool;