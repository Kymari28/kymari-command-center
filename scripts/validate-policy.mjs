import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const policyUrl = new URL("../config/agent-policy.json", import.meta.url);
const policy = JSON.parse(await readFile(policyUrl, "utf8"));

assert.equal(policy.version, 1);
assert.equal(policy.defaultMode, "prepare");
assert.deepEqual(policy.priorityAreas, ["job", "college", "social"]);
assert.equal(policy.firstLook.changesWorkflowStatus, false);
assert.equal(policy.firstLook.maximumItems, 5);
assert.equal(policy.agentRouting.automaticAssignment, true);
assert.equal(policy.agentRouting.changesWorkflowStatus, false);
assert.equal(policy.agentRouting.recordsReason, true);
assert.equal(policy.agentRouting.manualOverrideWins, true);

const requiredApprovalRules = [
  "send_message",
  "submit_application_or_form",
  "publish_or_schedule_content",
  "spend_or_commit_money",
  "delete_data",
  "change_access_or_permissions",
  "share_sensitive_data",
  "merge_pull_request",
  "commit_to_main"
];

for (const rule of requiredApprovalRules) {
  assert.ok(policy.approvalRequired.includes(rule), `Missing approval rule: ${rule}`);
}

const overlap = policy.autoAllowed.filter(rule => policy.approvalRequired.includes(rule));
assert.deepEqual(overlap, [], "An action cannot be both automatic and approval-required");

console.log("Agent policy: valid");
