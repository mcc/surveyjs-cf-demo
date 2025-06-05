var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-VuO71e/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// node_modules/itty-router/index.mjs
var t = /* @__PURE__ */ __name(({ base: e = "", routes: t2 = [], ...r2 } = {}) => ({ __proto__: new Proxy({}, { get: /* @__PURE__ */ __name((r3, o2, a2, s2) => (r4, ...c2) => t2.push([o2.toUpperCase?.(), RegExp(`^${(s2 = (e + r4).replace(/\/+(\/|$)/g, "$1")).replace(/(\/?\.?):(\w+)\+/g, "($1(?<$2>*))").replace(/(\/?\.?):(\w+)/g, "($1(?<$2>[^$1/]+?))").replace(/\./g, "\\.").replace(/(\/?)\*/g, "($1.*)?")}/*$`), c2, s2]) && a2, "get") }), routes: t2, ...r2, async fetch(e2, ...o2) {
  let a2, s2, c2 = new URL(e2.url), n2 = e2.query = { __proto__: null };
  for (let [e3, t3] of c2.searchParams) n2[e3] = n2[e3] ? [].concat(n2[e3], t3) : t3;
  e: try {
    for (let t3 of r2.before || []) if (null != (a2 = await t3(e2.proxy ?? e2, ...o2))) break e;
    t: for (let [r3, n3, l, i] of t2) if ((r3 == e2.method || "ALL" == r3) && (s2 = c2.pathname.match(n3))) {
      e2.params = s2.groups || {}, e2.route = i;
      for (let t3 of l) if (null != (a2 = await t3(e2.proxy ?? e2, ...o2))) break t;
    }
  } catch (t3) {
    if (!r2.catch) throw t3;
    a2 = await r2.catch(t3, e2.proxy ?? e2, ...o2);
  }
  try {
    for (let t3 of r2.finally || []) a2 = await t3(a2, e2.proxy ?? e2, ...o2) ?? a2;
  } catch (t3) {
    if (!r2.catch) throw t3;
    a2 = await r2.catch(t3, e2.proxy ?? e2, ...o2);
  }
  return a2;
} }), "t");
var r = /* @__PURE__ */ __name((e = "text/plain; charset=utf-8", t2) => (r2, o2 = {}) => {
  if (void 0 === r2 || r2 instanceof Response) return r2;
  const a2 = new Response(t2?.(r2) ?? r2, o2.url ? void 0 : o2);
  return a2.headers.set("content-type", e), a2;
}, "r");
var o = r("application/json; charset=utf-8", JSON.stringify);
var a = /* @__PURE__ */ __name((e) => ({ 400: "Bad Request", 401: "Unauthorized", 403: "Forbidden", 404: "Not Found", 500: "Internal Server Error" })[e] || "Unknown Error", "a");
var s = /* @__PURE__ */ __name((e = 500, t2) => {
  if (e instanceof Error) {
    const { message: r2, ...o2 } = e;
    e = e.status || 500, t2 = { error: r2 || a(e), ...o2 };
  }
  return t2 = { status: e, ..."object" == typeof t2 ? t2 : { error: t2 || a(e) } }, o(t2, { status: e });
}, "s");
var c = /* @__PURE__ */ __name((e) => {
  e.proxy = new Proxy(e.proxy ?? e, { get: /* @__PURE__ */ __name((t2, r2) => t2[r2]?.bind?.(e) ?? t2[r2] ?? t2?.params?.[r2], "get") });
}, "c");
var n = /* @__PURE__ */ __name(({ format: e = o, missing: r2 = /* @__PURE__ */ __name(() => s(404), "r"), finally: a2 = [], before: n2 = [], ...l } = {}) => t({ before: [c, ...n2], catch: s, finally: [(e2, ...t2) => e2 ?? r2(...t2), e, ...a2], ...l }), "n");
var p = r("text/plain; charset=utf-8", String);
var f = r("text/html");
var u = r("image/jpeg");
var h = r("image/png");
var g = r("image/webp");

// src/auth.ts
async function generateToken(username, secret) {
  try {
    if (!username || !secret) {
      throw new Error("Missing username or secret");
    }
    const encoder = new TextEncoder();
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })).replace(/=/g, "");
    const payload = btoa(JSON.stringify({
      username,
      exp: Math.floor(Date.now() / 1e3) + 24 * 60 * 60
      // 24 hours
    })).replace(/=/g, "");
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(`${header}.${payload}`)
    );
    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=/g, "");
    const token = `${header}.${payload}.${signatureBase64}`;
    if (!token) {
      throw new Error("Generated token is empty");
    }
    return token;
  } catch (e) {
    console.error("Generate token error:", e.message);
    throw new Error(`Failed to generate token: ${e.message}`);
  }
}
__name(generateToken, "generateToken");
async function verifyToken(token, secret) {
  try {
    const [header, payload, signature] = token.split(".");
    if (!header || !payload || !signature) {
      throw new Error("Invalid token format");
    }
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const expectedSignature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(`${header}.${payload}`)
    );
    const expectedSignatureBase64 = btoa(String.fromCharCode(...new Uint8Array(expectedSignature))).replace(/=/g, "");
    if (signature !== expectedSignatureBase64) {
      throw new Error("Invalid signature");
    }
    const decodedPayload = JSON.parse(atob(payload));
    if (decodedPayload.exp < Math.floor(Date.now() / 1e3)) {
      throw new Error("Token expired");
    }
  } catch (e) {
    console.error("Verify token error:", e.message);
    throw new Error(`Token verification failed: ${e.message}`);
  }
}
__name(verifyToken, "verifyToken");

// src/index.ts
var router = n();
router.options("*", () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
});
router.post("/api/login", async ({ json }, env) => {
  try {
    const { username, password } = await json();
    if (!username || !password) {
      throw new Error("Missing username or password", { status: 400 });
    }
    if (username !== env.ADMIN_USERNAME || password !== env.ADMIN_PASSWORD) {
      throw new Error("Invalid credentials", { status: 401 });
    }
    const token = await generateToken(username, env.JWT_SECRET);
    if (!token) {
      throw new Error("Failed to generate token", { status: 500 });
    }
    return {
      data: { token },
      headers: { "Access-Control-Allow-Origin": "*" }
    };
  } catch (e) {
    console.error("Login error:", e.message);
    throw new Error(e.message || "Login failed", { status: e.status || 500 });
  }
});
router.get("/api/surveys", async (request, env) => {
  const surveys = [];
  const list = await env.SURVEY_KV.list();
  for (const key of list.keys) {
    const survey = await env.SURVEY_KV.get(key.name, "json");
    surveys.push({ id: key.name, title: survey.title });
  }
  return {
    data: surveys,
    headers: { "Access-Control-Allow-Origin": "*" }
  };
});
router.get("/api/surveys/:id", async ({ params }, env) => {
  const id = params.id;
  const survey = await env.SURVEY_KV.get(id, "json");
  if (!survey) {
    throw new Error("Survey not found", { status: 404 });
  }
  return {
    data: survey,
    headers: { "Access-Control-Allow-Origin": "*" }
  };
});
router.post("/api/surveys", async ({ headers, json, url }, env) => {
  const authHeader = headers.get("Authorization");
  if (!authHeader) {
    throw new Error("Authorization header missing", { status: 401 });
  }
  if (authHeader === env.API_KEY) {
    const survey = await json();
    const surveyId = survey.id || Date.now().toString();
    await env.SURVEY_KV.put(surveyId, JSON.stringify(survey));
    const surveyUrl = `${new URL(url).origin}/survey.html?id=${surveyId}`;
    return {
      message: "Survey saved",
      surveyId,
      surveyUrl,
      headers: { "Access-Control-Allow-Origin": "*" }
    };
  } else if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "");
    try {
      await verifyToken(token, env.JWT_SECRET);
      const survey = await json();
      const surveyId = survey.id || Date.now().toString();
      await env.SURVEY_KV.put(surveyId, JSON.stringify(survey));
      const surveyUrl = `${new URL(url).origin}/survey.html?id=${surveyId}`;
      return {
        message: "Survey saved",
        surveyId,
        surveyUrl,
        headers: { "Access-Control-Allow-Origin": "*" }
      };
    } catch (e) {
      throw new Error(`Invalid token: ${e.message}`, { status: 401 });
    }
  } else {
    throw new Error("Invalid Authorization header format", { status: 401 });
  }
});
router.delete("/api/surveys/:id", async ({ headers, params }, env) => {
  const authHeader = headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Bearer token required", { status: 401 });
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    await verifyToken(token, env.JWT_SECRET);
    const id = params.id;
    const survey = await env.SURVEY_KV.get(id, "json");
    if (!survey) {
      throw new Error("Survey not found", { status: 404 });
    }
    await env.SURVEY_KV.delete(id);
    return {
      message: "Survey deleted",
      headers: { "Access-Control-Allow-Origin": "*" }
    };
  } catch (e) {
    throw new Error(`Invalid token: ${e.message}`, { status: 401 });
  }
});
router.post("/api/submissions", async ({ json }, env) => {
  const { surveyId, data } = await json();
  const submissionId = Date.now().toString();
  await env.SURVEY_KV.put(`submission:${surveyId}:${submissionId}`, JSON.stringify(data));
  return {
    message: "Submission saved",
    headers: { "Access-Control-Allow-Origin": "*" }
  };
});
var src_default = {
  fetch: router.fetch
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-VuO71e/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-VuO71e/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
