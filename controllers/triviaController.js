const model = require('../models/triviaModel');



//Checks if there was a value provided
function hasValue(value){
    return value !== undefined && value !== null && String(value).trim() !== '';
}


function parseInt(value){
    const n = Number(value);
    return n > 0 && n <= 2147483647 ? n : null;
}

async function getTopics(req, res, next){
    try{
        res.json(await model.getAllTopics());
    }catch(err){
        next(err);
    }
}

async function getQuestionsInTopic(req, res, next){
    try{
        const { topic } = req.params;
        const options = {};
        
        if(req.query.limit !== undefined){
            const limit = parseInt(req.query.limit);
            if(limit === null){
                return res.status(400).json({error: 'limit must be a positive number whole number.'});
            }
            options.limit = limit;
        }

        if(req.query.difficulty !== undefined){
            const difficulty = String(req.query.difficulty).trim().toLowerCase();
            if((!model.VALID_DIFF).includes(difficulty)){
                return res.status(400).json({error: `difficulty must be one of: ${model.VALID_DIFF.join(' , ')}.`});
            }
            options.difficulty = difficulty;
        }

        if(!(await model.topicExists(topic))){
            return res.status(400).json({error: `Topic '${topic}' was not found.`});
        }
        res.json(await model.getQuestionsByTopic(topic, options));
    }catch(err){
        next(err);
    }
}

async function getRandomQuestion(req, res, next){
    try{
        const question = await model.getRandomQuestion();
        if(!question){
            return res.status(404).json({error: 'There are no questions in the database yet.'});
        }
        res.json(question);
    }catch(err){
        next(err);
    }
}

async function checkAnswer(req, res, next){
    try{
        const { id, guess } = req.body || {};

        if(!hasValue(id) || !hasValue(guess)){
            return res.status(400).json({ error: "Both 'id' and 'guess' are required."});
        }
        const questionId = parseInt(id);
        if(questionId == null){
            return res.status(400).json({error: "'id' must be a positive whole number."});
        }
        const found = await model.getQuestionById(questionId);
        if(!found){
            return res.status(404).json({error: `Question with id ${questionId} was not found.`});
        }

        const correct = String(guess).trim().toLowerCase() === found.answer.trim().toLowerCase();
        res.json({id: found.id, correct, correctAnswer: found.answer});
    }catch(err){
        next(err);
    }
}

async function addQuestion(req, res, next) {
    try{
        const body = req.body || {};
        const missing = ['topic', 'question', 'answer', 'difficulty'].filter((f) => !hasValue(body[f]));
        if(missing.length > 0){
            return res.status(400).json({error: `Missing required field(s): ${missing.join(', ')}.`});
        }

        const difficulty = String(body.difficulty).trim().toLowerCase();
        if(!model.VALID_DIFF.includes(difficulty)){
            return res.status(400).json({error: `difficulty must be one of: ${model.VALID_DIFF.join(', ')}.`});
        }
        await model.addQuestion({
            topic: String(body.topic),
            question: String(body.question),
            answer: String(body.answer),
            difficulty
        });

        res.status(201).json(await model.getQuestionsByTopic(String(body.topic)));
    }catch(err){
        next(err);
    }
}

module.exports = {
    getTopics,
    getQuestionsInTopic,
    getRandomQuestion,
    checkAnswer,
    addQuestion
};