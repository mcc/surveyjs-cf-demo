const creator = new SurveyCreator.SurveyCreator({
  showLogicTab: true,
  showTranslationTab: true,
});

creator.saveSurveyFunc = async (saveNo, callback) => {
  const surveyJson = creator.JSON;
  const surveyId = surveyJson.id || Date.now().toString();
  surveyJson.id = surveyId;
  surveyJson.title = surveyJson.title || `Survey ${surveyId}`;
  await fetch('/api/surveys', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': localStorage.getItem('adminToken'),
    },
    body: JSON.stringify(surveyJson),
  });
  callback(saveNo, true);
};

creator.render('surveyCreator');