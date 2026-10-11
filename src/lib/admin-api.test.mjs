import assert from "node:assert/strict";
import test from "node:test";
import { adminApiUrl, readAdminApiResponse } from "./admin-api.ts";

for (const base of [
  "https://api.example.test/api/v1/admin",
  "https://api.example.test/api/v1/admin/",
  " https://api.example.test/api/v1/admin/// ",
]) {
  test("assignment endpoints work with API base " + JSON.stringify(base), () => {
    for (const endpoint of [
      "order-assignments/recipients?assignment_type=agent",
      "auto-order-workflows/packing",
      "auto-order-workflows/returns",
      "employee-orders/12",
      "/orders/bulk-assign",
    ]) {
      assert.equal(adminApiUrl(endpoint, base), "https://api.example.test/api/v1/admin/" + endpoint.replace(/^\//, ""));
    }
  });
}

test("successful API responses retain employee and pool data", async () => {
  const payload = { success: true, data: { enabled: false, employees: [], priorities: [] } };
  assert.deepEqual(await readAdminApiResponse(Response.json(payload)), payload);
});

for (const [status, expected] of [
  [401, /session has expired/],
  [403, /permission/],
  [404, /endpoint is unavailable/],
  [405, /endpoint is unavailable/],
  [429, /Too many requests/],
  [500, /API error log/],
  [503, /API error log/],
]) {
  test("HTML error responses explain HTTP " + status + " without exposing server output", async () => {
    await assert.rejects(
      readAdminApiResponse(new Response("<html>PRIVATE-SERVER-DETAILS</html>", { status })),
      (error) => {
        assert.match(error.message, expected);
        assert.match(error.message, new RegExp("HTTP " + status));
        assert.doesNotMatch(error.message, /PRIVATE-SERVER-DETAILS|Unexpected token/);
        return true;
      },
    );
  });
}

test("disabled features are distinguished from role permissions", async () => {
  await assert.rejects(
    readAdminApiResponse(Response.json({ code: "FEATURE_DISABLED" }, { status: 403 })),
    /Feature Control/,
  );
});

test("server exceptions do not disclose SQL or debug data", async () => {
  await assert.rejects(
    readAdminApiResponse(Response.json({ message: "SQLSTATE PRIVATE-SQL" }, { status: 500 })),
    (error) => {
      assert.doesNotMatch(error.message, /SQLSTATE|PRIVATE-SQL/);
      return true;
    },
  );
});

test("validation messages remain actionable", async () => {
  await assert.rejects(
    readAdminApiResponse(Response.json({ message: "The selected employee is invalid." }, { status: 422 })),
    /selected employee is invalid/,
  );
});

test("HTML success pages cannot masquerade as an empty employee list", async () => {
  await assert.rejects(readAdminApiResponse(new Response("<html>Login</html>")), /unexpected response/);
});
