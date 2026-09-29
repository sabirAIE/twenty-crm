import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type WorkflowRunPinnedDependencies } from 'src/modules/workflow/application-workflow-lifecycle/types/workflow-run-pinned-dependencies.type';
import { computeAgentExecutionFingerprint } from 'src/modules/workflow/application-workflow-lifecycle/utils/compute-agent-execution-fingerprint.util';
import { computeLogicFunctionExecutionFingerprint } from 'src/modules/workflow/application-workflow-lifecycle/utils/compute-logic-function-execution-fingerprint.util';
import { getWorkflowStepsExecutionDependencies } from 'src/modules/workflow/application-workflow-lifecycle/utils/get-workflow-steps-execution-dependencies.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const computeWorkflowRunPinnedDependencies = ({
  steps,
  flatLogicFunctionMaps,
  flatAgentMaps,
}: {
  steps: WorkflowAction[];
} & Pick<
  AllFlatEntityMaps,
  'flatLogicFunctionMaps' | 'flatAgentMaps'
>): WorkflowRunPinnedDependencies => {
  const { logicFunctionIds, agentIds } =
    getWorkflowStepsExecutionDependencies(steps);

  const logicFunctionFingerprintById: Record<string, string> = {};

  for (const logicFunctionId of logicFunctionIds) {
    const flatLogicFunction = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: logicFunctionId,
      flatEntityMaps: flatLogicFunctionMaps,
    });

    if (isDefined(flatLogicFunction)) {
      logicFunctionFingerprintById[logicFunctionId] =
        computeLogicFunctionExecutionFingerprint(flatLogicFunction);
    }
  }

  const agentFingerprintById: Record<string, string> = {};

  for (const agentId of agentIds) {
    const flatAgent = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: agentId,
      flatEntityMaps: flatAgentMaps,
    });

    if (isDefined(flatAgent)) {
      agentFingerprintById[agentId] =
        computeAgentExecutionFingerprint(flatAgent);
    }
  }

  return { logicFunctionFingerprintById, agentFingerprintById };
};
