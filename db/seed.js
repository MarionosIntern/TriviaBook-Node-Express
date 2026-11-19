const fs = require('fs');
const path = require('path');
const pool = require('../db/db');

const topics = ['science', 'geography'];

let scienceQuestions = [
  { question: 'What planet is known as the Red Planet?', answer: 'Mars', difficulty: 'easy' },
  { question: 'What is the chemical symbol for gold?', answer: 'Au', difficulty: 'medium' },
  { question: 'What is the powerhouse of the cell?', answer: 'Mitochondria', difficulty: 'easy' }
];

let geographyQuestions = [
  { question: 'What is the capital of Australia?', answer: 'Canberra', difficulty: 'medium' },
  { question: 'Which river flows through Cairo?', answer: 'The Nile', difficulty: 'easy' }
];

const questionByTopic = {
    science: scienceQuestions,
    geography: geographyQuestions
};

async function seed(){
    const client = await pool.connect();
    try{
        await client.query('begin');
        for(const topic of topics){
            const { rows } = await client.query('insert into topics (name) VALUES ($1) returning id', [topic]);
            const topicId = rows[0].id;
            for(const q of questionByTopic[topic]){
                await client.query('insert into questions (topic_id, question, answer, difficulty) values ($1, $2, $3, $4)', [topicId, q.question, q.answer, q.difficulty]);
            }
        }
        await client.query('COMMIT');
        console.log('Database seeded: 2 topics, 5 questions');
    }catch(err){
        await client.query('ROLLBACK');
        console.error('Seeding Fallback:', err.message);
        process.exitCode = 1;
    }finally{
        client.release();
        await pool.end();
    }
}

seed();