const viewPage = document.getElementById('page-header');
const libraryBtn = document.getElementById('libraryBtn');
const authorBtn = document.getElementById('authorBtn');
const learnBtn = document.getElementById('learn-btn');
let viewContainer = '';
let questions = JSON.parse(localStorage.getItem('questions') ??"[]");
const PROG_KEY = id => `pc_progress_${id}`;
function loadProg(id) {
    try {
        return JSON.parse(localStorage.getItem(PROG_KEY(id))) || {};
    } catch (e) {
        return {};
    }
}
function saveProg(id, prog) {
    localStorage.setItem(PROG_KEY(id), JSON.stringify(prog));
}

function setLibrary(e) {
    if (questions.length === 0) {
        viewPage.innerHTML = `
      <div class="text-center text-secondary p-5">
        <h4>No capsules yet</h4>
        <p>Click “Add Capsule” or import a .json file to get started.</p>
       
      </div>
      <div class="d-flex justify-content-center align-items-center w-100 gap-2">
      <button  class="button-64" role="button"  id="add-capsule" onclick="addCapsule()"><span class="text"><i class="fa-solid fa-plus" ></i> New Capsule</span></button>
                <input type="file" id="importJson" accept=".json" class="d-none">
                <button class="btn btn-outline-primary" onclick="document.getElementById('importJson').click()">Import .json</button>
</div>
    `;
        return;
    }

    console.log(questions);
    viewContainer = `
        <div id="library_header" class=" d-flex justify-content-between align-items-baseline border-bottom border-secondary p-2">
             <div class=" d-flex flex-column ">
                 <h2>Your Capsules</h2>
                 <p class="text-secondary">Create, import, export and manage learning capsules. All data will stay on your browser.</p>
             </div>
             <div class="d-flex gap-2 flex-column">
                 <button  class="button-64" role="button"  id="add-capsule" onclick="addCapsule()"><span class="text"><i class="fa-solid fa-plus" ></i> New Capsule</span></button>
                <input type="file" id="importJson" accept=".json" class="d-none">
                <button class="btn btn-outline-primary" style="border: 3px solid; font-size: large " onclick="document.getElementById('importJson').click()">Import .json</button>
             </div>
         </div>
    <section id="viewLibrary" class="row mt-5">
        ${
        questions.map((q, index) => {
            const prog = loadProg(q.id) || {};
            const bestScore = Math.min(prog.bestScore ?? 0, 100);
            const knownCount = Math.min((prog.knownFlashcards || []).length, q.flashcards?.length || 0);
            return `
    <div class="card w-340px col-md-4 col-lg-3 bg-transparent text-white bg-dark rounded shadow">
      <div class="card-header d-flex justify-content-between p-3">    
        <div>
          <h3>${q.title}</h3>
          <p class="text-secondary">${q.subject}</p>
        </div>
        <div>
          <span class="text-small border border-secondary rounded p-1 text-secondary">${q.level}</span>
        </div>
      </div>

      <div class="card-body">
        <div class="d-flex justify-content-between pb-3">
          <div class="w-75 p-3">
            <p>Quiz Best</p>
            <div class="progress" style="height: 8px;">
              <div class="progress-bar bg-primary" role="progressbar"
                   style="width: ${bestScore}%;" 
                   aria-valuenow="${bestScore}" aria-valuemin="0" aria-valuemax="100">
              </div>
            </div>
            <p class="mt-1">${bestScore}%</p>
          </div>
          <div class="border-start text-center p-1">
            <p>Known Cards</p>
            <p>${knownCount} / ${q.flashcards?.length || 0}</p>
          </div>
        </div>

        <div>
          <button class="btn btn-outline-success" onclick="openLearn(${index})">Learn</button>
          <button class="btn btn-outline-primary" onclick="editCapsule(${index})"><i class="fa-solid fa-pen"></i></button> 
          <button class="btn btn-outline-info" onclick="exportCapsule(${index})">
            <i class="fa-solid fa-download"></i>
            <span class="tooltip">Export</span>
          </button>
          <button class="btn btn-danger" onclick="destroyCapsule(${index})"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    </div>
    
  `;

        }).join('')}
        </section>
`;
    viewPage.innerHTML = viewContainer;

}
function addCapsule(){
    renderAuthor();
}
setLibrary();
document.getElementById('importJson').addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        try {
            let data = JSON.parse(event.target.result);

            // Normalize to array
            if (!Array.isArray(data)) data = [data];

            // Assign unique IDs if missing
            data.forEach(capsule => {
                if (!capsule.id) capsule.id = crypto.randomUUID();
            });

            // Merge and save
            questions.push(...data);
            localStorage.setItem('questions', JSON.stringify(questions)); // ✅ Save to localStorage
            setLibrary();
        } catch (err) {
            alert("Failed to import: " + err.message);
        }
    };
    reader.readAsText(file);
});
const author_data =  {
    id:Date.now(),
    title: "",
    subject: "",
    level: 1,
    description: "",
    note: '',
    flashcards: [
        // {front:"", back:""}
    ],
    quiz: [
        // {q:"", answers:["","","",""], correct_answer:-1,description:""}
    ],


}
const setAuthorData = ({name, value, index = -1, sub = "",sub_index=-1} = null) => {
    console.log(index)
    if (index > -1) {
        if(sub_index>-1)
            author_data[name][index][sub][sub_index]['value'] = value;
        else author_data[name][index][sub] = value;
    } else
        author_data[name] = value;
    console.log("author data", author_data);
}
libraryBtn.addEventListener('click', setLibrary);
authorBtn.addEventListener('click', (e) => {
    renderAuthor();
});
function renderAuthor() {
    viewContainer = `
     <div class="d-flex justify-content-between align-items-baseline border-bottom border-secondary w-100 mb-3">
            <div>
                <h2>Author Capsule</h2>
                <p class="text-secondary">Draft notes, flashcard, and quizzes. Auto-save locally.</p>
            </div>
            <div class="">
                <button class="btn btn-success" onclick="setLibrary()">Back</button>
                <button class="btn btn-danger" type="submit" id="submit-capsule" onclick="saveFlashcards(); ">Save</button>
            </div>
        </div>
        <div class="row justify-content-between">
            <div class="d-flex flex-column gap-2 ">
                <p class="h4">Meta</p>
                <div>
                    <label for="title">Title</label>
                    <input  type="text" value="${author_data.title}" id="title" class="text-white  w-100 rounded" onchange="setAuthorData({name:'title', value:event.target.value})">
                </div>
                <div>
                    <label for="subject">Subject</label>
                    <input  type="text" value="${author_data.subject}" id="subject" class=" w-100 rounded text-white"  onchange="setAuthorData({name:'subject', value:event.target.value})">
                </div>
                <div>
                    <label for="level">Level</label>
                    <select id="level" class="w-100  text-white rounded"  onchange="setAuthorData({name:'level', value:event.target.options[event.target.selectedIndex].text})">
                        <option class="bg-dark" value="1" selected>Beginner</option>
                        <option class="bg-dark" value="2">Intermediate</option>
                        <option class="bg-dark" value="3">Advanced</option>
                    </select>
                </div>
                <div>
                    <label for="description">Description</label>
                    <textarea id="description" class=" w-100  text-white " cols="7" onchange="setAuthorData({name:'description', value:event.target.value})">${author_data.description}</textarea>
                </div>
            </div>
            <div class="">
                <p class="h4">Notes <span class="text-small h6 text-secondary">(One idea per line)</span></p>
                <textarea id="" class=" w-100  text-white" rows="7" cols="7" onchange="setAuthorData({name:'note', value:event.target.value})">${author_data.note}</textarea>
                  
            </div>

            <div class=" mt-5 ">
                <div class=" ">
                <div class="d-flex justify-content-between flex-row">
                    <div><p class="h4">Flashcards</p></div>
                    <div>
                        <button type="button" class="btn btn-primary" onclick="setAuthorArrayData('flashcards', {front:'', back:''}) " id="flashAdd-btn">Add</button>
                    </div>
                </div>
                <div id="flash-table" class="flash-container align-items-center w-100 ">
                  ${author_data.flashcards.map((flashcard, index) => {
                        return `<div class="flash-container mt-2" id="flash-tr">
                            <div class=" flash-td p-0 m-0">
                              <input  value="${flashcard.front}" class="cardFront m-1"
                                     onchange="setAuthorData({name:'flashcards', value: event.target.value, index: ${index}, sub: 'front'})"
                                     placeholder="front">
                            </div>
                            <div class="m-0 p-0">
                              <input  value="${flashcard.back}" class="cardBack m-1"
                                     onchange="setAuthorData({name:'flashcards', value: event.target.value, index: ${index}, sub: 'back'})"
                                     placeholder="back">
                            </div>
                            <div class="">
                            <button class="btn btn-danger flash_destroy w-100 m-1" onclick="destroyFlash(${index})">Remove</button>
                            </div>
                          </div>`;
                        }).join('')}

                </div>
            </div>
            </div>
            <div class=" quiz-part pt-5">
                <table class="quiz-table">
                    <thead>
                    <div class="d-flex justify-content-between ">
                        <div><p class="h4">Quiz</p></div>
                        <div>
                            <button class="btn btn-primary" onclick="setAuthorArrayData('quiz', {q:'', a:[{value:'', name:'A'},{value:'', name:'B'},{value:'', name:'C'},{value:'', name:'D'}],c:-1,d:''}) "  id="quiz-add-btn">Add</button>
                        </div>
                    </div>
                    </thead>
                    <tbody id="quiz-list" class="border-bottom w-100  gap-2 ">
                        ${author_data.quiz.map((qs, index) => {
                        return `<div class="quiz_div mt-2">
                            <div class="div_quiz">
                              <input  value="${qs.q}" class="input question_input  col-5 w-100"
                                   onchange="setAuthorData({name:'quiz', value: event.target.value, index: ${index}, sub: 'q'})"
                                   placeholder="Question">
                            </div>
                          </div>
        
                               
<div class="choices-part mt-3 mb-3">
${qs.a.map((an, i) => {
                            return `
                                      <div class="input-field">
                                        <input  value="${an.value}" class="input -group"
                                             onchange="setAuthorData({name:'quiz', value: event.target.value, index: ${index}, sub: 'a', sub_index:${i}})"
                                             placeholder="${an.name}"> 
                                    </div>
                                `
                        }).join('')
                        }
</div>
                        
                          <div class="inputs-row mb-3">
                          <div>
                                <input  value="${qs.c}" class=""
                                     onchange="setAuthorData({name:'quiz', value: event.target.value, index: ${index}, sub: 'c'})"
                                     placeholder="Correct Answer"> 
                            </div>
                            <div>
                                <input  value="${qs.d}"
                                     onchange="setAuthorData({name:'quiz', value: event.target.value, index: ${index}, sub: 'd'})"
                                     placeholder="Description"> 
                            </div>
                          </div>
                          <div>
                          <div>
                               <button class="btn btn-danger" onclick="destroyQuiz(${index})">Remove</button>
                        </div>
                        </div>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>`
    viewPage.innerHTML = viewContainer;

}
learnBtn.addEventListener('click', () => {
    viewContainer = `
    <div class="learn_container">
      <div class="learn_header d-flex justify-content-between">
        <div class="learn_title">
          <h4>Learn</h4>
          <p>Study a capsule in Notes, Flashcards, or Quiz mode.</p>
        </div>
        <div class="learn_buttons d-flex flex-column col-md-3 row-gap-2">
         <select id="questionSelect" class="border border-primary bg-transparent text-white p-2">
  <option value="" disabled selected>Select a capsule...</option>
  ${questions.map((q, i) => `<option value="${i}">${q.title}</option>`).join('')}
</select>
          <button type="button" id="exportBtn" class="btn border border-primary text-white">Export</button>
        </div>
      </div>
      <div class="learn_body">
        <div class="learn-buttons d-flex flex-column gap-2">
          <button class="btn btn-outline-primary" type="button" id="notesBtn">Notes</button>
          <button class="btn btn-outline-primary" type="button" id="flashView">Flashcards</button>
          <button class="btn btn-outline-primary" type="button" id="quizView">Quiz</button>
        </div>
        <div class="learn_content p-3 mt-3 border rounded bg-transparent text-white">
          <!-- dynamic content goes here -->
        </div>
      </div>
    </div>`;

    viewPage.innerHTML = viewContainer;

    const notesBtn = document.querySelector('#notesBtn');
    const flashBtn = document.querySelector('#flashView');
    const quizBtn = document.querySelector('#quizView');

    [notesBtn, flashBtn, quizBtn].forEach(btn => btn.disabled = true);

    let currentId = 0;
    let currentCapsule = questions[currentId];
    const content = document.querySelector('.learn_content');


    const select = document.querySelector('#questionSelect');
    select.addEventListener('change', e => {
        currentId = +e.target.value;
        currentCapsule = questions[currentId];
        [notesBtn, flashBtn, quizBtn].forEach(btn => btn.disabled = false);
        content.innerHTML = `<p>Select a mode to start learning.</p>`;
    });


    document.querySelector('#notesBtn').addEventListener('click', () => {
        if (!currentCapsule.note?.length) {
            content.innerHTML = `<p>No notes available.</p>`;
            return;
        }
        content.innerHTML = `
      <h5>Notes</h5>
      <ol id="notesList">${currentCapsule.notes}</ol>
    `
    });

    function mountFlashcards(contentEl, capsule) {
        if (!capsule.flashcards?.length) {
            contentEl.innerHTML = `<p>No flashcards available.</p>`;
            return;
        }

        let idx = 0;
        let prog = loadProg(capsule.id) || {};
        let known = new Set(prog.knownFlashcards || []);

        renderFlashcard();

        function renderFlashcard() {
            const fc = capsule.flashcards[idx];
            const isKnown = known.has(idx);

            contentEl.innerHTML = `
      <h5>Flashcards</h5>
      <div class="flashcard border p-4 text-center">
        <div class="front">${fc.front}</div>
        <div class="back d-none">${fc.back}</div>
      </div>

      <div class="mt-3 d-flex justify-content-between">
        <button id="prevBtn" class="btn btn-sm btn-secondary">Prev</button>
        <button id="flipBtn" class="btn btn-sm btn-primary">Flip</button>
        <button id="nextBtn" class="btn btn-sm btn-secondary">Next</button>
      </div>

      <div class="mt-3 d-flex justify-content-center gap-2">
        <button id="knownBtn" class="btn btn-success ${isKnown ? '' : 'opacity-50'}">Known</button>
        <button id="unknownBtn" class="btn btn-danger ${!isKnown ? '' : 'opacity-50'}">Unknown</button>
      </div>


       <p class="mt-2">Card ${idx + 1} of ${capsule.flashcards.length}</p>
      <p class="mt-1">Progress: ${known.size} / ${capsule.flashcards.length} cards known</p>
    `;


            document.querySelector('#flipBtn').onclick = () => {
                document.querySelector('.front').classList.toggle('d-none');
                document.querySelector('.back').classList.toggle('d-none');
            };


            document.querySelector('#prevBtn').onclick = () => {
                if (idx > 0) { idx--; renderFlashcard(); }
            };
            document.querySelector('#nextBtn').onclick = () => {
                if (idx < capsule.flashcards.length - 1) { idx++; renderFlashcard(); }
                else finishDeck();
            };


            document.querySelector('#knownBtn').onclick = () => {
                known.add(idx);
                saveProg(capsule.id, {
                    ...loadProg(capsule.id),
                    knownFlashcards: [...known]
                });
                if (idx < capsule.flashcards.length - 1) {
                    idx++;
                    renderFlashcard();
                } else finishDeck();
            };
            document.querySelector('#flashView').addEventListener('click', () => {
                mountFlashcards(content, currentCapsule);
            });

            document.querySelector('#unknownBtn').onclick = () => {
                known.delete(idx);
                saveProg(capsule.id, { ...prog, knownFlashcards: [...known] });
                if (idx < capsule.flashcards.length - 1) {
                    idx++;
                    renderFlashcard();
                } else finishDeck();
            };
        }

        function finishDeck() {
            contentEl.innerHTML = `
      <h5>Flashcards finished</h5>
      <p>You marked ${known.size} of ${capsule.flashcards.length} as known.</p>
    `;
        }
    }
    document.querySelector('#flashView').addEventListener('click', () => {
        mountFlashcards(content, currentCapsule);
    });
    function mountQuizView(contentEl, capsule) {
        const Q = Array.isArray(capsule.quiz) ? capsule.quiz : [];
        if (!Q.length) {
            contentEl.innerHTML = `<p>No quiz available.</p>`;
            return;
        }

        let i = 0;
        let correct = 0;
        let currentQ = null;

        renderQ();

        function renderQ() {
            currentQ = Q[i];
            const correctIndex = Number(currentQ.c);
            const hasValidCorrect = Number.isInteger(correctIndex) && correctIndex >= 0 && correctIndex < currentQ.a.length;

            contentEl.innerHTML = `
      <h5>Quiz</h5>
      <p class="mb-3">${escapeHTML(currentQ.q || 'Untitled question')}</p>
      <div>
        ${currentQ.a.map((choice, idx) => `
          <button class="choice btn btn-outline-light d-block mb-2" data-idx="${idx}">
            <strong>${choice.name}:</strong> ${escapeHTML(choice.value || '')}
          </button>
        `).join('')}
      </div>
      ${!hasValidCorrect ? `<div class="text-warning mt-2">No correct answer set for this question.</div>` : ''}
    `;
            contentEl.querySelectorAll('.choice').forEach(btn => {
                btn.onclick = () => {
                    const choiceIndex = +btn.dataset.idx;
                    if (choiceIndex === correctIndex) {
                        correct++;
                    }
                    i++;
                    if (i < Q.length) {
                        renderQ();
                    } else {
                        finish();
                    }
                };
            });
        }

        function finish() {
            const score = Math.round((correct / Q.length) * 100);
            const prog = loadProg(capsule.id) || {};
            const best = Math.max(score, prog.bestScore || 0);
            saveProg(capsule.id, { ...prog, bestScore: best });

            contentEl.innerHTML = `
    <h5>Quiz finished</h5>
    <p>Your score: ${score}% (${correct}/${Q.length})</p>
  `;
            console.log("Capsule:", capsule.title, "Score:", score, "Correct:", correct, "Total:", Q.length);
        }

        function escapeHTML(s) {
            return String(s).replace(/[&<>"']/g, ch =>
                ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch])
            );
        }
    }
    document.querySelector('#quizView').addEventListener('click', () => {
        if (!currentCapsule.quiz?.length) {
            content.innerHTML = `<p>No quiz available.</p>`;
            return;
        }
        mountQuizView(content, currentCapsule);
    });
    document.querySelector('#exportBtn').addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentCapsule, null, 2));
        const dl = document.createElement('a');
        dl.setAttribute("href", dataStr);
        dl.setAttribute("download", `${currentCapsule.title.replace(/\s+/g, '_')}.json`);
        dl.click();
    });
});
function setAuthorArrayData(name, value) {
    author_data[name].push(value);
    console.log(author_data);
    renderAuthor();
}
function destroyFlash(i){
    author_data.flashcards.splice(i,1);
    renderAuthor();
    localStorage.setItem('questions', JSON.stringify(questions));
}
function destroyQuiz(i){
    author_data.quiz.splice(i,1);
    renderAuthor();
    localStorage.setItem('questions', JSON.stringify(questions));
}
function destroyCapsule(i){
    questions.splice(i,1);
    setLibrary();
    localStorage.setItem('questions', JSON.stringify(questions));
}
function saveFlashcards() {
        questions = JSON.parse(localStorage.getItem('questions') ?? "[]");
        questions.push(author_data);
        localStorage.setItem('questions', JSON.stringify(questions));
}
function editCapsule(index) {
    const capsule = questions[index];

    viewPage.innerHTML = `
    <div class="edit-form text-white p-4 bg-transparent rounded shadow w-100">
      <h4>Edit Capsule</h4>

      <label class="form-label mt-3">Title</label>
      <input type="text" id="editTitle" class="form-control" value="${capsule.title}">

      <label class="form-label mt-3">Subject</label>
      <input type="text" id="editSubject" class="form-control" value="${capsule.subject}">

      <label class="form-label mt-3">Level</label>
      <input type="text" id="editLevel" class="form-control" value="${capsule.level}">

      <hr class="my-4">

     <h5>Flashcards</h5>
<div id="flashcardEditor">
  ${capsule.flashcards.map((fc, i) => `
    <div class="card bg-transparent p-2 mb-2 rounded" data-fc="${i}">
      <input type="text" class="form-control mb-1" placeholder="Front" value="${fc.front}" id="fcFront${i}">
      <input type="text" class="form-control" placeholder="Back" value="${fc.back}" id="fcBack${i}">
      <button class="btn btn-sm btn-danger mt-2" onclick="deleteFlashcard(${i})">Delete</button>
    </div>
  `).join('')}
</div>
<button class="btn btn-sm btn-outline-light mt-2" onclick="addFlashcard()">+ Add Flashcard</button>

      <hr class="my-4">

      <h5>Quiz Questions</h5>
<div id="quizEditor">
  ${capsule.quiz.map((qz, i) => `
    <div class="card bg-transparent p-2 mb-2 rounded" data-quiz="${i}">
      <input type="text" class="form-control mb-1" placeholder="Question" value="${qz.q}" id="quizQ${i}">
      ${qz.a.map((choice, j) => `
        <input type="text" class="form-control mb-1" placeholder="Choice ${choice.name}" value="${choice.value}" id="quizA${i}_${j}">
      `).join('')}
      <label class="form-label mt-1 text-white">Correct Answer Index</label>
      <input type="number" class="form-control" value="${qz.c}" id="quizC${i}">
      <button class="btn btn-sm btn-danger mt-2" onclick="deleteQuiz(${i})">Delete</button>
    </div>
  `).join('')}
</div>
<button class="btn btn-sm btn-outline-light mt-2" onclick="addQuiz()">+ Add Quiz Question</button>

      <div class="mt-4 d-flex gap-2">
        <button class="btn btn-success" id="saveBtn" onclick="saveCapsule(${index})">Update Capsule</button>
        <button class="btn btn-secondary" onclick="setLibrary()">Cancel</button>
      </div>
    </div>
  `;
}
function addFlashcard() {
    const container = document.querySelector('#flashcardEditor');
    const i = container.children.length;
    container.insertAdjacentHTML('beforeend', `
    <div class="card bg-transparent p-2 mb-2 rounded">
      <input type="text" class="form-control mb-1" placeholder="Front" id="fcFront${i}">
      <input type="text" class="form-control" placeholder="Back" id="fcBack${i}">
    </div>
  `);
}

function addQuiz() {
    const container = document.querySelector('#quizEditor');
    const i = container.children.length;
    container.insertAdjacentHTML('beforeend', `
    <div class="card bg-transparent p-2 mb-2 rounded">
      <input type="text" class="form-control mb-1" placeholder="Question" id="quizQ${i}">
      <input type="text" class="form-control mb-1" placeholder="Choice A" id="quizA${i}_0">
      <input type="text" class="form-control mb-1" placeholder="Choice B" id="quizA${i}_1">
      <input type="text" class="form-control mb-1" placeholder="Choice C" id="quizA${i}_2">
      <input type="text" class="form-control mb-1" placeholder="Choice D" id="quizA${i}_3">
      <label class="form-label mt-1">Correct Answer Index</label>
      <input type="number" class="form-control" id="quizC${i}">
    </div>
  `);
}
function saveCapsule(index) {
    const capsule = questions[index];

    capsule.title = document.querySelector('#editTitle').value.trim();
    capsule.subject = document.querySelector('#editSubject').value.trim();
    capsule.level = document.querySelector('#editLevel').value.trim();

    // Flashcards
    const fcEls = document.querySelectorAll('#flashcardEditor > .card');
    capsule.flashcards = Array.from(fcEls).map((el, i) => ({
        front: document.querySelector(`#fcFront${i}`).value.trim(),
        back: document.querySelector(`#fcBack${i}`).value.trim()
    })).filter(fc => fc.front || fc.back);

    // Quiz
    const qzEls = document.querySelectorAll('#quizEditor > .card');
    capsule.quiz = Array.from(qzEls).map((el, i) => ({
        q: document.querySelector(`#quizQ${i}`).value.trim(),
        a: ['A', 'B', 'C', 'D'].map((name, j) => ({
            name,
            value: document.querySelector(`#quizA${i}_${j}`).value.trim()
        })),
        c: Number(document.querySelector(`#quizC${i}`).value)
    })).filter(qz => qz.q);

    setLibrary();
    localStorage.setItem('questions', JSON.stringify(questions));
}
function deleteFlashcard(i) {
    const el = document.querySelector(`[data-fc="${i}"]`);
    if (el) el.remove();
    localStorage.setItem('questions', JSON.stringify(questions));
}
function deleteQuiz(i) {
    const el = document.querySelector(`[data-quiz="${i}"]`);
    if (el) el.remove();
    localStorage.setItem('questions', JSON.stringify(questions));
}
function openLearn(index) {
    const capsule = questions[index];
    currentCapsule = capsule;
    currentIndex = index;

    // Save capsule ID for progress tracking
    localStorage.setItem('currentCapsuleId', capsule.id);

    // Render Learn view layout
    viewPage.innerHTML = `
    <div class="learn-header text-white p-3 bg-transparent d-flex justify-content-between align-items-center">
      <h4>${capsule.title}</h4>
      <button class="btn btn-secondary" onclick="setLibrary()">← Back to Library</button>
    </div>

    <div class="learn-tabs d-flex gap-2 p-3 bg-transparent border-bottom border-secondary">
      <button class="btn btn-outline-light" onclick="showNotes()">Notes</button>
      <button class="btn btn-outline-light" onclick="showFlashcards()">Flashcards</button>
      <button class="btn btn-outline-light" onclick="startQuiz()">Quiz</button>
    </div>

    <div id="learnContent" class="p-4 text-white"></div>
  `;

    showNotes(); // Default view
}
function showNotes() {
    const content = document.getElementById('learnContent');
    content.innerHTML = `
    <h5>Notes</h5>
    <textarea class="form-control" rows="10" oninput="saveNotes(this.value)">${currentCapsule.notes || ''}</textarea>
  `;
}

function saveNotes(text) {
    currentCapsule.notes = text;
    localStorage.setItem('questions', JSON.stringify(questions));
}

function showFlashcards() {
    const content = document.getElementById('learnContent');
    const cards = currentCapsule.flashcards || [];

    if (cards.length === 0) {
        content.innerHTML = `<p class="text-muted">No flashcards available.</p>`;
        return;
    }

    let current = 0;

    function renderCard() {
        const card = cards[current];
        content.innerHTML = `
      <div class="card bg-transparent text-white p-4">
        <h5>Flashcard ${current + 1} of ${cards.length}</h5>
        <p class="mt-3">${card.front}</p>
        <button class="btn btn-outline-light mt-2" onclick="this.nextElementSibling.classList.toggle('d-none')">Show Answer</button>
        <p class="mt-2 d-none">${card.back}</p>
        <div class="mt-4 d-flex justify-content-between">
          <button class="btn btn-secondary" ${current === 0 ? 'disabled' : ''} onclick="current--; renderCard()">← Prev</button>
          <button class="btn btn-secondary" ${current === cards.length - 1 ? 'disabled' : ''} onclick="current++; renderCard()">Next →</button>
        </div>
      </div>
    `;
    }

    renderCard();
}
function startQuiz() {
    const content = document.getElementById('learnContent');
    const quiz = currentCapsule.quiz || [];

    if (quiz.length === 0) {
        content.innerHTML = `<p class="text-muted">No quiz questions available.</p>`;
        return;
    }

    let current = 0;
    let correct = 0;

    function renderQuestion() {
        const q = quiz[current];
        content.innerHTML = `
      <div class="card bg-transparent text-white p-4">
        <h5>Question ${current + 1} of ${quiz.length}</h5>
        <p class="mt-3">${q.q}</p>
        ${q.a.map((choice, i) => `
          <button class="btn btn-outline-light d-block my-2" onclick="checkAnswer(${i})">${choice.name}: ${choice.value}</button>
        `).join('')}
      </div>
    `;
    }

    window.checkAnswer = function (i) {
        if (i === quiz[current].c) correct++;
        current++;
        if (current < quiz.length) {
            renderQuestion();
        } else {
            const score = Math.round((correct / quiz.length) * 100);
            const prog = loadProg(currentCapsule.id) || {};
            const best = Math.max(score, prog.bestScore || 0);
            saveProg(currentCapsule.id, { ...prog, bestScore: best });

            content.innerHTML = `
        <div class="text-center p-4">
          <h4>Quiz Complete!</h4>
          <p>Your score: ${score}% (${correct} of ${quiz.length})</p>
          <button class="btn btn-outline-light mt-3" onclick="startQuiz()">Retry Quiz</button>
        </div>
      `;
        }
    };

    renderQuestion();
}

function exportCapsule(index) {
    const capsule = questions[index];
    const data = JSON.stringify(capsule, null, 2); // Pretty format

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${capsule.title.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}


