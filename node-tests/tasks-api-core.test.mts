import assert from "node:assert/strict";
import test from "node:test";

import * as createCoreModule from "../frontend/lib/tasks/tasks-create-core.ts";
import * as getCoreModule from "../frontend/lib/tasks/tasks-get-core.ts";

const { executeCreateTaskRequest } = createCoreModule;
const { executeGetTaskRequest } = getCoreModule;

test("create task returns 400 on invalid JSON", async () => {
  const response = await executeCreateTaskRequest({
    parseJsonBody: async () => {
      throw new Error("invalid json");
    },
    createTask: async () => ({ ok: false, reason: "db_error" }),
    createTaskId: () => "task-1",
  });

  assert.deepEqual(response, {
    status: 400,
    body: {
      ok: false,
      error: "Invalid JSON payload.",
    },
  });
});

test("create task returns 500 when the store is unavailable", async () => {
  const response = await executeCreateTaskRequest({
    parseJsonBody: async () => ({ intent: "ship it" }),
    createTask: async () => ({ ok: false, reason: "unavailable" }),
    createTaskId: () => "task-1",
  });

  assert.deepEqual(response, {
    status: 500,
    body: {
      ok: false,
      error: "Unable to create task.",
    },
  });
});

test("get task returns 404 when the task is missing", async () => {
  const response = await executeGetTaskRequest({
    rawTaskId: "task-404",
    getTaskById: async () => ({ ok: false, reason: "not_found" }),
  });

  assert.deepEqual(response, {
    status: 404,
    body: {
      ok: false,
      error: "Task not found.",
    },
  });
});

test("get task returns 500 when the store is unavailable", async () => {
  const response = await executeGetTaskRequest({
    rawTaskId: "task-500",
    getTaskById: async () => ({ ok: false, reason: "unavailable" }),
  });

  assert.deepEqual(response, {
    status: 500,
    body: {
      ok: false,
      error: "Unable to load task.",
    },
  });
});
