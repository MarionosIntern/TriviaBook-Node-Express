# TriviaBook-Node-Express
A fullstack trivia application: **Node/Express API** with **Postgres** database with Neon and a simple, but interactive frontend. 

**Live Site:** `https://triviabook-node-express.onrender.com`

## TriviaBook Database  Schema

**topics**

|column | type | attributes |
|-------|------|------------|
| id    |serial| primary key|
| name  | text | not null unique|

**questions**

|column | type | attributes |
|-------|------|------------|
| id    |serial| primary key|
| topic_id | INTEGER | foreign key -> topics(id), `ON DELETE CASCADE` |
| question | TEXT    | not null |
| answer| TEXT | not null |
| difficulty | TEXT | not null, `CHECK` in (`easy`, `medium`, `hard`) |


create index if not exist idx_question_topic_id on questions(topic_id);

## Setup
1. Cloned repo in VsCode
2. `npm install`
3. Created a Neon Database and copied the connection string
4. Made a `.env` file and initialized `DATABASE_URL` with the connection string
5. `npm run seed` to fill the database with questions and categories given
6. `npm start`

## Endpoints
1. http://localhost:3000/TriviaBook-Node-Express/topics
2. http://localhost:3000/TriviaBook-Node-Express/topic/science
3. http://localhost:3000/TriviaBook-Node-Express/random
4. http://localhost:3000/TriviaBook-Node-Express/answer 
JSON body - { "id": 1, "guess": "Mars" }
5. http://localhost:3000/TriviaBook-Node-Express/question/add
JSON body - {
                "topic": "mathematics", 
                "question": "What type of problems do Laplace Transforms help solve?",
                "answer": "Second Order Differential Equations",
                "difficulty": "hard"
            }