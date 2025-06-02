async function loadSurveys() {
  const response = await fetch('/api/surveys');
  const surveys = await response.json();
  const surveyList = document.getElementById('survey-list');
  surveys.forEach(survey => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="/survey.html?id=${survey.id}">${survey.title}</a>`;
    surveyList.appendChild(li);
  });
}

async function loadSurvey() {
  const urlParams = new URLSearchParams(window.location.search);
  const surveyId = urlParams.get('id');
  if (surveyId) {
    const response = await fetch(`/api/surveys/${surveyId}`);
    const surveyJson = await response.json();
    const survey = new Survey.Model(surveyJson);
    survey.onComplete.add(async (sender) => {
      await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surveyId, data: sender.data }),
      });
      alert('Survey submitted!');
    });
    const surveyContainer = document.getElementById('surveyContainer');
    survey.render(surveyContainer);
  }
}

if (document.getElementById('survey-list')) {
  loadSurveys();
} else if (document.getElementById('surveyContainer')) {
  loadSurvey();
}