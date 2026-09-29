import { computeAgentExecutionFingerprint } from 'src/modules/workflow/application-workflow-lifecycle/utils/compute-agent-execution-fingerprint.util';
import { computeLogicFunctionExecutionFingerprint } from 'src/modules/workflow/application-workflow-lifecycle/utils/compute-logic-function-execution-fingerprint.util';
import { type FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

const logicFunction = {
  checksum: 'checksum-1',
  handlerName: 'main',
  runtime: 'nodejs22.x',
  workflowActionTriggerSettings: { inputSchema: [], outputSchema: {} },
} as unknown as FlatLogicFunction;

const agent = {
  prompt: 'You summarize',
  modelId: 'auto',
  responseFormat: { type: 'json', schema: { a: 1, b: 2 } },
  modelConfiguration: null,
} as unknown as FlatAgent;

describe('computeLogicFunctionExecutionFingerprint', () => {
  it('changes with the built code', () => {
    expect(computeLogicFunctionExecutionFingerprint(logicFunction)).not.toBe(
      computeLogicFunctionExecutionFingerprint({
        ...logicFunction,
        checksum: 'checksum-2',
      }),
    );
  });

  it('changes when the function stops being a workflow action', () => {
    expect(computeLogicFunctionExecutionFingerprint(logicFunction)).not.toBe(
      computeLogicFunctionExecutionFingerprint({
        ...logicFunction,
        workflowActionTriggerSettings: null,
      }),
    );
  });

  it('ignores properties that do not change the executed code', () => {
    expect(computeLogicFunctionExecutionFingerprint(logicFunction)).toBe(
      computeLogicFunctionExecutionFingerprint({
        ...logicFunction,
        name: 'renamed',
        timeoutSeconds: 30,
        workflowActionTriggerSettings: { inputSchema: [{ name: 'x' }] },
      } as unknown as FlatLogicFunction),
    );
  });
});

describe('computeAgentExecutionFingerprint', () => {
  it('changes with the prompt', () => {
    expect(computeAgentExecutionFingerprint(agent)).not.toBe(
      computeAgentExecutionFingerprint({ ...agent, prompt: 'You translate' }),
    );
  });

  it('does not depend on the key order of JSON settings', () => {
    expect(computeAgentExecutionFingerprint(agent)).toBe(
      computeAgentExecutionFingerprint({
        ...agent,
        responseFormat: { schema: { b: 2, a: 1 }, type: 'json' },
      } as unknown as FlatAgent),
    );
  });

  it('treats a missing model configuration like an empty one', () => {
    expect(computeAgentExecutionFingerprint(agent)).toBe(
      computeAgentExecutionFingerprint({
        ...agent,
        modelConfiguration: undefined,
      } as unknown as FlatAgent),
    );
  });

  it('ignores the label and role', () => {
    expect(computeAgentExecutionFingerprint(agent)).toBe(
      computeAgentExecutionFingerprint({
        ...agent,
        label: 'Renamed',
        roleId: 'role-2',
      } as unknown as FlatAgent),
    );
  });
});
