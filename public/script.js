const $ = (id) => document.getElementById(id);
let currentId = null;

async function api(path, options) {
    const res = await fetch('/TriviaBook-Node-Express' + path, options);
    return {ok: res.ok, data: await res.json()};
}

function say(el, text, ok){
    el.textContent = text;
    el.className = 'msg' + (ok ? 'ok' : 'bad');
}

function renderQuestions(list){
    $('searchResults').innerHTML = '';
    for(const q of list){
        const li = document.createElement('li');
        li.textContent = '[' + q.difficulty + ']' + q.question;
        $('searchResults').appendChild(li);
    }
}

async function loadTopics(){
    const {data} = await api('/topics');
    $('topicList').textContent = data.length ? data.join(', '): 'No Topics yet.';
    $('topicSelect').innerHTML = '';
    for(const t of data){
        $('topicSelect').add(new Option(t, t));
    }
}

$('rdmBtn').onclick = async () => {
    const { ok, data } = await api('/random');
    $('guessResult').textContent = '';
    $('guessInput').value = '';
    if(!ok){
        $('rdmQ').textContent = data.error;
        $('guessBox').hidden = true;
        return;
    }
    currentId = data.id;
    $('rdmQ').textContent = '(' + data.topic + ', ' + data.difficulty + ')' + data.question;
    $('guessBox').hidden = false;
};

$('guessBtn').onclick = async () => {
    const { ok, data} = await api('/answer', {
        method:'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({id: currentId , guess: $('guessInput').value})
    });
    if(!ok){
        return say($('guessResult'), data.error, false);
    }
    say($('guessResult'), data.correct ? 'Correct!' : 'Incorrect. The Answer is: ' + data.correctAnswer, data.correct);
};

loadTopics();


