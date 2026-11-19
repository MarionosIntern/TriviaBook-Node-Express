const $ = (id) => document.getElementById(id);
let currentId = null;

//Calls the Triviabook API
async function api(path, options) {
    const res = await fetch('/TriviaBook-Node-Express' + path, options);
    return {ok: res.ok, data: await res.json()};
}


function say(el, text, ok){
    el.textContent = text;
    el.className = 'msg' + (ok ? 'ok' : 'bad');
}

//Renders one <li> per question for search
function renderQuestions(list){
    $('searchResults').innerHTML = '';
    for(const q of list){
        const li = document.createElement('li');
        li.textContent = '[' + q.difficulty + ']' + q.question;
        $('searchResults').appendChild(li);
    }
}

//Loads topics and adds any new topic created 
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

    //server data comparisons 
    say($('guessResult'), data.correct ? 'Correct!' : 'Incorrect. The Answer is: ' + data.correctAnswer, data.correct);
};

$('searchBtn').onclick = async () =>{
    const topic = $('topicSelect').value;

    //Builds the optional query string
    const params = new URLSearchParams();
    if($('diffSelect').value){
        params.set('difficulty', $('diffSelect').value);
    }
    if($('limitInput').value){
        params.set('limit', $('limitInput').value);
    }
    //encodeURIComponet keeps topics with spaces or symbols safe in the URL
    const { ok, data } = await api('/topic/' + encodeURIComponent(topic) + '?' + params);
    if(!ok){
        $('searchResults').innerHTML = '';
        return say($('searchMsg'), data.error, false);
    }
    say($('searchMsg'), data.length + ' question(s)', true);
    renderQuestions(data);
};

$('addForm').onsubmit = async (e) => {
    e.preventDefault();
    const { ok,data } = await api('/question/add', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            topic: $('addTopic').value,
            question: $('addQuestion').value,
            answer: $('addAnswer').value,
            difficulty: $('addDiff').value
        })
    });
    if(!ok){
        return say($('addMsg'), data.error, false);
    }
    //Returning the updated question's list
    say($('addMsg'), 'Added! "' + data[0].topic + '" now has ' + data.length + ' question(s).', true);
    $('addForm').reset();
    loadTopics();
};

loadTopics();


