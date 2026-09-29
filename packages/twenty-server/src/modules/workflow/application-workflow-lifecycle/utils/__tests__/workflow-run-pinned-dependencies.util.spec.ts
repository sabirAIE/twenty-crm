import { WorkflowActionType } from 'twenty-shared/workflow';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { computeWorkflowRunPinnedDependencies } from 'src/modules/workflow/application-workflow-lifecycle/utils/compute-workflow-run-pinned-dependencies.util';
import { hasWorkflowStepPinnedDependencyChanged } from 'src/modules/workflow/application-workflow-lifecycle/utils/has-workflow-step-pinned-dependency-changed.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const greet = {
  id: 'greet-id',
  universalIdentifier: 'greet-uid',
  checksum: 'checksum-1',
  handlerName: 'main',
  runtime: 'nodejs22.x',
  workflowActionTriggerSettings: {},
  deletedAt: null,
};

const summarizer = {
  id: 'summarizer-id',
  universalIdentifier: 'summarizer-uid',
  prompt: 'You summarize',
  modelId: 'auto',
  responseFormat: { type: 'text' },
  modelConfiguration: null,
  deletedAt: null,
};

const buildMaps = ({
  logicFunctions = [greet],
  agents = [summarizer],
}: {
  logicFunctions?: Record<string, unknown>[];
  agents?: Record<string, unknown>[];
} = {}) =>
  ({
    flatLogicFunctionMaps: {
      byUniversalIdentifier: Object.fromEntries(
        logicFunctions.map((logicFunction) => [
          logicFunction.universalIdentifier,
          logicFunction,
        ]),
      ),
      universalIdentifierById: Object.fromEntries(
        logicFunctions.map((logicFunction) => [
          logicFunction.id,
          logicFunction.universalIdentifier,
        ]),
      ),
      universalIdentifiersByApplicationId: {},
    },
    flatAgentMaps: {
      byUniversalIdentifier: Object.fromEntries(
        agents.map((agent) => [agent.universalIdentifier, agent]),
      ),
      universalIdentifierById: Object.fromEntries(
        agents.map((agent) => [agent.id, agent.universalIdentifier]),
      ),
      universalIdentifiersByApplicationId: {},
    },
  }) as unknown as Pick<
    AllFlatEntityMaps,
    'flatLogicFunctionMaps' | 'flatAgentMaps'
  >;

const greetStep = {
  id: 'greet',
  name: 'Greet',
  type: WorkflowActionType.LOGIC_FUNCTION,
  valid: true,
  nextStepIds: ['summarize'],
  settings: {
    input: { logicFunctionId: 'greet-id', logicFunctionInput: {} },
    outputSchema: {},
    errorHandlingOptions: {},
  },
} as unknown as WorkflowAction;

const summarizeStep = {
  id: 'summarize',
  name: 'Summarize',
  type: WorkflowActionType.AI_AGENT,
  valid: true,
  nextStepIds: [],
  settings: {
    input: { agentId: 'summarizer-id', prompt: 'Summarize' },
    outputSchema: {},
    errorHandlingOptions: {},
  },
} as unknown as WorkflowAction;

describe('workflow run pinned dependencies', () => {
  const pinnedDependencies = computeWorkflowRunPinnedDependencies({
    steps: [greetStep, summarizeStep],
    ...buildMaps(),
  });

  it('pins every function and agent the run references', () => {
    expect(
      Object.keys(pinnedDependencies.logicFunctionFingerprintById),
    ).toEqual(['greet-id']);
    expect(Object.keys(pinnedDependencies.agentFingerprintById)).toEqual([
      'summarizer-id',
    ]);
  });

  it('accepts a step whose definitions did not change', () => {
    expect(
      hasWorkflowStepPinnedDependencyChanged({
        step: greetStep,
        pinnedDependencies,
        ...buildMaps(),
      }),
    ).toBe(false);
  });

  it('rejects a step whose function was rebuilt after the run started', () => {
    expect(
      hasWorkflowStepPinnedDependencyChanged({
        step: greetStep,
        pinnedDependencies,
        ...buildMaps({
          logicFunctions: [{ ...greet, checksum: 'checksum-2' }],
        }),
      }),
    ).toBe(true);
  });

  it('rejects a step whose function was removed', () => {
    expect(
      hasWorkflowStepPinnedDependencyChanged({
        step: greetStep,
        pinnedDependencies,
        ...buildMaps({ logicFunctions: [] }),
      }),
    ).toBe(true);
  });

  it('rejects a step whose agent prompt changed', () => {
    expect(
      hasWorkflowStepPinnedDependencyChanged({
        step: summarizeStep,
        pinnedDependencies,
        ...buildMaps({
          agents: [{ ...summarizer, prompt: 'You translate' }],
        }),
      }),
    ).toBe(true);
  });

  it('rejects a function that was not pinned when the run started', () => {
    expect(
      hasWorkflowStepPinnedDependencyChanged({
        step: greetStep,
        pinnedDependencies: {
          logicFunctionFingerprintById: {},
          agentFingerprintById: {},
        },
        ...buildMaps(),
      }),
    ).toBe(true);
  });
});
