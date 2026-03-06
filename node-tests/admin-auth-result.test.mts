import assert from "node:assert/strict";
import test from "node:test";

import * as adminAuthModule from "../frontend/lib/admin-auth.ts";

const { getAdminRoleForUser, isValidAdminToken } = adminAuthModule;

test("accepts the configured admin access token", () => {
  process.env.ADMIN_ACCESS_TOKEN = "secret-admin-token";
  assert.equal(isValidAdminToken("secret-admin-token"), true);
  assert.equal(isValidAdminToken("wrong-token"), false);
});

test("returns explicit not_found when admin role row is absent", async () => {
  const fakeClient = {
    from() {
      return {
        select() {
          return {
            eq() {
              return {
                limit() {
                  return {
                    maybeSingle: async () => ({
                      data: null,
                      error: null,
                    }),
                  };
                },
              };
            },
          };
        },
      };
    },
  };

  const result = await getAdminRoleForUser(fakeClient as never, "user-1");
  assert.deepEqual(result, {
    ok: false,
    reason: "not_found",
  });
});

test("returns explicit lookup_error on admin role query failure", async () => {
  const fakeClient = {
    from() {
      return {
        select() {
          return {
            eq() {
              return {
                limit() {
                  return {
                    maybeSingle: async () => ({
                      data: null,
                      error: {
                        code: "db_error",
                        message: "boom",
                      },
                    }),
                  };
                },
              };
            },
          };
        },
      };
    },
  };

  const result = await getAdminRoleForUser(fakeClient as never, "user-1");
  assert.deepEqual(result, {
    ok: false,
    reason: "lookup_error",
  });
});
