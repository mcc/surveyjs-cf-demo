import { AutoRouter } from 'itty-router';
import { verifyToken, generateToken } from './auth';

interface Env {
  SURVEY_KV: KVNamespace;
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD: string;
  API_KEY: string;
}

const router = AutoRouter();

router
  // Admin login
  .post('/api/login', async ({ json }, env: Env) => {
    const { username, password } = await json();
    if (username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD) {
      const token = generateToken(username);
      return { token };
    }
    throw new Error('Invalid credentials', { status: 401 });
  })

  // List all surveys
  .get('/api/surveys', async (request, env: Env) => {
    const surveys = [];
    const list = await env.SURVEY_KV.list();
    for (const key of list.keys) {
      const survey = await env.SURVEY_KV.get(key.name, 'json');
      surveys.push({ id: key.name, title: survey.title });
    }
    return surveys;
  })

  // Get a specific survey
  .get('/api/surveys/:id', async ({ params }, env: Env) => {
    const id = params.id;
    const survey = await env.SURVEY_KV.get(id, 'json');
    if (!survey) {
      throw new Error('Survey not found', { status: 404 });
    }
    return survey;
  })

  // Create or update a survey (admin or API key)
  .post('/api/surveys', async ({ headers, json }, env: Env) => {
    const authHeader = headers.get('Authorization');
    if (!authHeader || (!authHeader.startsWith('Bearer ') && authHeader !== env.API_KEY)) {
      throw new Error('Unauthorized', { status: 401 });
    }

    const survey = await json();
    const surveyId = survey.id || Date.now().toString();
    await env.SURVEY_KV.put(surveyId, JSON.stringify(survey));
    return 'Survey saved';
  })

  // Delete a survey
  .delete('/api/surveys/:id', async ({ headers, params }, env: Env) => {
    const authHeader = headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Unauthorized', { status: 401 });
    }
    const id = params.id;
    const survey = await env.SURVEY_KV.get(id, 'json');
    if (!survey) {
      throw new Error('Survey not found', { status: 404 });
    }
    await env.SURVEY_KV.delete(id);
    return 'Survey deleted';
  })

  // Handle survey submissions
  .post('/api/submissions', async ({ json }, env: Env) => {
    const { surveyId, data } = await json();
    const submissionId = Date.now().toString();
    await env.SURVEY_KV.put(`submission:${surveyId}:${submissionId}`, JSON.stringify(data));
    return 'Submission saved';
  });

// Export the router's fetch handler
export default {
  fetch: router.fetch,
};