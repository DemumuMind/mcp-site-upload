import assert from "node:assert/strict";
import test from "node:test";

import { authorizeTaskApiRequest } from "../frontend/lib/tasks/task-api-auth.ts";

test("rejects task API requests without bearer token when auth is required", () => {
  process.env.TASKS_API_AUTH_MODE = "required";
  process.env.TASKS_API_BEARER_TOKEN = "secret-token";

  const request = new Request("https://example.test/api/tasks", {
    method: "POST",
  });

  assert.equal(authorizeTaskApiRequest(request), false);
});

test("accepts a matching bearer token", () => {
  process.env.TASKS_API_AUTH_MODE = "required";
  process.env.TASKS_API_BEARER_TOKEN = "secret-token";

  const request = new Request("https://example.test/api/tasks", {
    method: "POST",
    headers: {
      Authorization: "Bearer secret-token",
    },
  });

  assert.equal(authorizeTaskApiRequest(request), true);
});
