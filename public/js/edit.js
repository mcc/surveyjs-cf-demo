const creator = new SurveyCreator.SurveyCreator({
  showLogicTab: true,
  showTranslationTab: true,
});

const jsonEditor = document.getElementById('jsonEditor');
let currentSurveyId = null;

async function loadSurvey() {
  const urlParams = new URLSearchParams(window.location.search);
  const surveyId = urlParams.get('id');
  if (surveyId) {
    const response = await fetch(`/api/surveys/${surveyId}`);
    const result = await response.json();
    const surveyJson = result.data || result; // Handle encapsulated data
    creator.JSON = surveyJson;
    jsonEditor.value = JSON.stringify(surveyJson, null, 2);
    currentSurveyId = surveyId;
    document.getElementById('editorTitle').textContent = `Edit Survey: ${surveyJson.title}`;
  } else {
    const newSurvey = { id: Date.now().toString(), title: `New Survey ${Date.now()}` };
    creator.JSON = newSurvey;
    jsonEditor.value = JSON.stringify(newSurvey, null, 2);
    currentSurveyId = null;
    document.getElementById('editorTitle').textContent = 'Create New Survey';
  }
}

async function saveSurvey() {
  const surveyJson = creator.JSON;
  const surveyId = currentSurveyId || Date.now().toString();
  surveyJson.id = surveyId;
  surveyJson.title = surveyJson.title || `Survey ${surveyId}`;
  try {
    const response = await fetch('/api/surveys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('adminToken') ? `Bearer ${localStorage.getItem('adminToken')}` : '',
      },
      body: JSON.stringify(surveyJson),
    });
    const result = await response.json();
    if (response.ok) {
      currentSurveyId = surveyId;
      jsonEditor.value = JSON.stringify(surveyJson, null, 2);
      const surveyUrl = result.surveyUrl || `/survey.html?id=${surveyId}`;
      alert(`Survey saved! Access it at: ${surveyUrl}`);
    } else {
      console.error('Save failed:', result);
      alert(`Failed to save survey: ${result.message || 'Unknown error'}`);
    }
  } catch (e) {
    console.error('Save error:', e);
    alert(`Failed to save survey: ${e.message}`);
  }
}

document.getElementById('applyJsonBtn').addEventListener('click', () => {
  try {
    const json = JSON.parse(jsonEditor.value);
    creator.JSON = json;
    currentSurveyId = json.id || currentSurveyId;
  } catch (e) {
    alert('Invalid JSON');
  }
});

creator.onModified.add(() => {
  jsonEditor.value = JSON.stringify(creator.JSON, null, 2);
});

document.getElementById('saveSurveyBtn').addEventListener('click', saveSurvey);
document.getElementById('backBtn').addEventListener('click', () => {
  window.location.href = '/manage.html';
});

creator.render('surveyCreator');
loadSurvey();