const pool = require('../db/db');

const VALID_DIFF = ['easy', 'medium', 'hard'];

function normalizeTopic(topic){
    return String(topic).trim().toLowerCase();
}

async function  getAllTopics(){
    const {rows} = await pool.query('select name from topics order by name');
    return rows.map((row) => row.name);
}

async function topicExists(topic){
    const {rowCount} = await pool.query('select 1 from topics where name = $1', [normalizeTopic(topic)]);
    return rowCount > 0;
}

async function getQuestionsByTopic(topic, {difficulty, limit} = {}){
    const params = [normalizeTopic(topic)];
    let sql = `select q.id, t.name as topic, q.question, q.answer, q.difficulty
               from questions q
               join topics t on t.id = q.topic_id
               where t.name = $1`;
    if(difficulty){
        params.push(difficulty);
        sql += ` and q.difficulty = $${params.length}`;
    }
    sql += ` order by q.id`;
    if(limit){
        params.push(limit);
        sql += ` limit $${params.length}`;
    }

    const {rows} = await pool.query(sql, params);
    return rows;
}

async function getRandomQuestion(){
    const { rows } = await pool.query(
        `select q.id, t.name as topic, q.question, q.difficulty
        from questions q
        join topics t on t.id = q.topic_id
        order by random()
        limit 1`
    );
    return rows[0] || null;
}

async function getQuestionById(id){
    const { rows } = await pool.query(`select id, answer from questions where id = $1`, [id]);
    return rows[0] || null;
}

async function addQuestion({topic, question, answer, difficulty}){
    const { rows } = await pool.query(
        `insert into topics (name) values ($1)
        on conflict (name) do update set name = excluded.name
        returning id`, [normalizeTopic(topic)]
    );
    await pool.query(
        `insert into questions (topic_id, question, answer, difficulty) values ($1, $2, $3, $4)`,
        [rows[0].id, question.trim(), answer.trim(), difficulty]
    );
}

module.exports = {
    VALID_DIFF,
    getAllTopics,
    topicExists,
    getQuestionsByTopic,
    getRandomQuestion,
    getQuestionById,
    addQuestion
};