import { AutoRouter } from 'itty-router';
import { verifyToken, generateToken } from './auth';

interface Env {
  SURVEY_KV: KVNamespace;
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD: string;
  API_KEY: string;
  JWT_SECRET: string;
}

const router = AutoRouter();

// CORS preflight
router.options('*', () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
});

// Admin login
router.post('/api/login', async ({ json }, env: Env) => {
  try {
    const { username, password } = await json();
    if (!username || !password) {
      throw new Error('Missing username or password', { status: 400 });
    }
    if (username !== env.ADMIN_USERNAME || password !== env.ADMIN_PASSWORD) {
      throw new Error('Invalid credentials', { status: 401 });
    }
    const token = await generateToken(username, env.JWT_SECRET);
    if (!token) {
      throw new Error('Failed to generate token', { status: 500 });
    }
    return {
      data: { token },
      headers: { 'Access-Control-Allow-Origin': '*' },
    };
  } catch (e) {
    console.error('Login error:', e.message);
    throw new Error(e.message || 'Login failed', { status: e.status || 500 });
  }
});

// List all surveys
router.get('/api/surveys', async (request, env: Env) => {
  const surveys = [];
  const list = await env.SURVEY_KV.list();
  for (const key of list.keys) {
    const survey = await env.SURVEY_KV.get(key.name, 'json');
    surveys.push({ id: key.name, title: survey.title });
  }
  return {
    data: surveys,
    headers: { 'Access-Control-Allow-Origin': '*' },
  };
});

// Get a specific survey
router.get('/api/surveys/:id', async ({ params }, env: Env) => {
  const id = params.id;
  const survey = await env.SURVEY_KV.get(id, 'json');
  if (!survey) {
    throw new Error('Survey not found', { status: 404 });
  }
  return {
    data: survey,
    headers: { 'Access-Control-Allow-Origin': '*' },
  };
});

// Create or update a survey (admin or API key)
router.post('/api/surveys', async ({ headers, json, url }, env: Env) => {
  const authHeader = headers.get('Authorization');
  if (!authHeader) {
    throw new Error('Authorization header missing', { status: 401 });
  }

  if (authHeader === env.API_KEY) {
    // API key authentication
    const survey = await json();
    const surveyId = survey.id || Date.now().toString();
    await env.SURVEY_KV.put(surveyId, JSON.stringify(survey));
    const surveyUrl = `${new URL(url).origin}/survey.html?id=${surveyId}`;
    return {
      message: 'Survey saved',
      surveyId,
      surveyUrl,
      headers: { 'Access-Control-Allow-Origin': '*' },
    };
  } else if (authHeader.startsWith('Bearer ')) {
    // JWT authentication
    const token = authHeader.replace('Bearer ', '');
    try {
      await verifyToken(token, env.JWT_SECRET);
      const survey = await json();
      const surveyId = survey.id || Date.now().toString();
      await env.SURVEY_KV.put(surveyId, JSON.stringify(survey));
      const surveyUrl = `${new URL(url).origin}/survey.html?id=${surveyId}`;
      return {
        message: 'Survey saved',
        surveyId,
        surveyUrl,
        headers: { 'Access-Control-Allow-Origin': '*' },
      };
    } catch (e) {
      throw new Error(`Invalid token: ${e.message}`, { status: 401 });
    }
  } else {
    throw new Error('Invalid Authorization header format', { status: 401 });
  }
});

// Delete a survey
router.delete('/api/surveys/:id', async ({ headers, params }, env: Env) => {
  const authHeader = headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Bearer token required', { status: 401 });
  }
  const token = authHeader.replace('Bearer ', '');
  try {
    await verifyToken(token, env.JWT_SECRET);
    const id = params.id;
    const survey = await env.SURVEY_KV.get(id, 'json');
    if (!survey) {
      throw new Error('Survey not found', { status: 404 });
    }
    await env.SURVEY_KV.delete(id);
    return {
      message: 'Survey deleted',
      headers: { 'Access-Control-Allow-Origin': '*' },
    };
  } catch (e) {
    throw new Error(`Invalid token: ${e.message}`, { status: 401 });
  }
});

// Handle survey submissions
router.post('/api/submissions', async ({ json }, env: Env) => {
  const { surveyId, data } = await json();
  const submissionId = Date.now().toString();
  await env.SURVEY_KV.put(`submission:${surveyId}:${submissionId}`, JSON.stringify(data));
  return {
    message: 'Submission saved',
    headers: { 'Access-Control-Allow-Origin': '*' },
  };
});

// Export the router's fetch handler
export default {
  fetch: router.fetch,
};