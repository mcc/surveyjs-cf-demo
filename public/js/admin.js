const creator = new SurveyCreator.SurveyCreator({
  showLogicTab: true,
  showTranslationTab: true,
});

const jsonEditor = document.getElementById('jsonEditor');
let currentSurveyId = null;

// Load survey list
async function loadSurveys() {
  const response = await fetch('http://localhost:8787/api/surveys');
  const surveys = await response.json();
  const surveyList = document.getElementById('surveyList');
  surveyList.innerHTML = '';
  surveys.forEach(survey => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${survey.title} (ID: ${survey.id})</span>
      <button onclick="editSurvey('${survey.id}')">Edit</button>
      <button onclick="deleteSurvey('${survey.id}')">Delete</button>
    `;
    surveyList.appendChild(li);
  });
}

// Edit an existing survey
async function editSurvey(surveyId) {
  const response = await fetch(`http://localhost:8787/api/surveys/${surveyId}`);
  const surveyJson = await response.json();
  creator.JSON = surveyJson;
  jsonEditor.value = JSON.stringify(surveyJson, null, 2);
  currentSurveyId = surveyId;
  document.getElementById('editorTitle').textContent = `Edit Survey: ${surveyJson.title}`;
}

// Add a new survey
function addSurvey() {
  creator.JSON = { id: Date.now().toString(), title: `New Survey ${Date.now()}` };
  jsonEditor.value = JSON.stringify(creator.JSON, null, 2);
  currentSurveyId = null;
  document.getElementById('editorTitle').textContent = 'Create New Survey';
}

// Delete a survey
async function deleteSurvey(surveyId) {
  if (confirm('Are you sure you want to delete this survey?')) {
    await fetch(`http://localhost:8787/api/surveys/${surveyId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': localStorage.getItem('adminToken'),
      },
    });
    loadSurveys();
    if (currentSurveyId === surveyId) {
      addSurvey(); // Reset editor
    }
  }
}

// Save survey
creator.saveSurveyFunc = async (saveNo, callback) => {
  const surveyJson = creator.JSON;
  const surveyId = currentSurveyId || Date.now().toString();
  surveyJson.id = surveyId;
  surveyJson.title = surveyJson.title || `Survey ${surveyId}`;
  await fetch('http://localhost:8787/api/surveys', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('adminToken'),
    },
    body: JSON.stringify(surveyJson),
  });
  currentSurveyId = surveyId;
  jsonEditor.value = JSON.stringify(surveyJson, null, 2);
  loadSurveys();
  callback(saveNo, true);
};

// Sync JSON editor with Creator
document.getElementById('applyJsonBtn').addEventListener('click', () => {
  try {
    const json = JSON.parse(jsonEditor.value);
    creator.JSON = json;
    currentSurveyId = json.id || currentSurveyId;
  } catch (e) {
    alert('Invalid JSON');
  }
});

// Update JSON editor when Creator changes
creator.onSurveyUpdated.add(() => {
  jsonEditor.value = JSON.stringify(creator.JSON, null, 2);
});

// Initialize
document.getElementById('addSurveyBtn').addEventListener('click', addSurvey);
creator.render('surveyCreator');
loadSurveys();
addSurvey(); // Start with a new survey