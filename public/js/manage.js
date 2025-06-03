async function loadSurveys() {
  const response = await fetch('/api/surveys');
  const result = await response.json();
  const surveys = result.data || result; // Handle encapsulated data
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

function editSurvey(surveyId) {
  window.location.href = `/edit.html?id=${surveyId}`;
}

async function deleteSurvey(surveyId) {
  if (confirm('Are you sure you want to delete this survey?')) {
    await fetch(`/api/surveys/${surveyId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': localStorage.getItem('adminToken'),
      },
    });
    loadSurveys();
  }
}

document.getElementById('createSurveyBtn').addEventListener('click', () => {
  window.location.href = '/edit.html';
});

loadSurveys();