import { Router } from 'itty-router';
import { verifyToken, generateToken } from './auth';
import { AutoRouter } from 'itty-router' // ~1kB

interface Env {
  SURVEY_KV: KVNamespace;
  ADMIN_USERNAME: string;
  ADMIN_PASSWORD: string;
  API_KEY: string;
}

const router = AutoRouter()

router
  .get('/hello/:name', ({ name }) => `Hello, ${name}!`)
  .get('/json', () => [1,2,3])
  .get('/promises', () => Promise.resolve('foo'))
  .post('/api/login', async (request: Request, env: Env) => {
      const { username, password } = await request.json();
      if (username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD) {
        const token = generateToken(username);
        return new Response(JSON.stringify({ token }), { status: 200 });
      }
      return new Response('Invalid credentials', { status: 401 });
    })
  .get('/api/surveys', async (request: Request, env: Env) => {
        console.log('test');
        const surveys = [];
        const list = await env.SURVEY_KV.list();
        for (const key of list.keys) {
          const survey = await env.SURVEY_KV.get(key.name, 'json');
          surveys.push({ id: key.name, title: survey.title });
        }
        return new Response(JSON.stringify(surveys), { status: 200 });
      })
      .post('/api/surveys', async (request: Request, env: Env) => {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || (!authHeader.startsWith('Bearer ') && authHeader !== env.API_KEY)) {
        return new Response('Unauthorized', { status: 401 });
      }

      const survey = await request.json();
      const surveyId = survey.id || Date.now().toString();
      await env.SURVEY_KV.put(surveyId, JSON.stringify(survey));
      return new Response('Survey saved', { status: 200 });
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
.post('/api/submissions', async (request: Request, env: Env) => {
      const { surveyId, data } = await request.json();
      const submissionId = Date.now().toString();
      await env.SURVEY_KV.put(`submission:${surveyId}:${submissionId}`, JSON.stringify(data));
      return new Response('Submission saved', { status: 200 });
    });


export default router

/*
export default {
  async fetch(request): Promise<Response> {
    const data = {
      hello: "world",
    };

    return Response.json(data);
  },
} satisfies ExportedHandler;
*/
/*

const router = Router();

// Admin login
router.post('/api/login', async (request: Request, env: Env) => {
  const { username, password } = await request.json();
  if (username === env.ADMIN_USERNAME && password === env.ADMIN_PASSWORD) {
    const token = generateToken(username);
    return new Response(JSON.stringify({ token }), { status: 200 });
  }
  return new Response('Invalid credentials', { status: 401 });
});

// List all surveys
router.get('/api/surveys', async (request: Request, env: Env) => {
  console.log('test');
  const surveys = [];
  const list = await env.SURVEY_KV.list();
  for (const key of list.keys) {
    const survey = await env.SURVEY_KV.get(key.name, 'json');
    surveys.push({ id: key.name, title: survey.title });
  }
  return new Response(JSON.stringify(surveys), { status: 200 });
});

// Get a specific survey
router.get('/api/surveys/:id', async (request: Request, env: Env) => {
  const id = request.params.id;
  const survey = await env.SURVEY_KV.get(id, 'json');
  if (!survey) {
    return new Response('Survey not found', { status: 404 });
  }
  return new Response(JSON.stringify(survey), { status: 200 });
});

// Create or update a survey (admin or API key)
router.post('/api/surveys', async (request: Request, env: Env) => {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || (!authHeader.startsWith('Bearer ') && authHeader !== env.API_KEY)) {
    return new Response('Unauthorized', { status: 401 });
  }

  const survey = await request.json();
  const surveyId = survey.id || Date.now().toString();
  await env.SURVEY_KV.put(surveyId, JSON.stringify(survey));
  return new Response('Survey saved', { status: 200 });
});

// Handle survey submissions
router.post('/api/submissions', async (request: Request, env: Env) => {
  const { surveyId, data } = await request.json();
  const submissionId = Date.now().toString();
  await env.SURVEY_KV.put(`submission:${surveyId}:${submissionId}`, JSON.stringify(data));
  return new Response('Submission saved', { status: 200 });
});

// Handle all other requests
router.all('*', () => new Response('Not found', { status: 404 }));

export default {
  fetch: async (request: Request, env: Env, ctx: ExecutionContext) => {
    return router.handle(request, env, ctx);
  },
};

*/