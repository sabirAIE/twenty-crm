import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type WorkflowRunPinnedDependencies } from 'src/modules/workflow/application-workflow-lifecycle/types/workflow-run-pinned-dependencies.type';
import { computeAgentExecutionFingerprint } from 'src/modules/workflow/application-workflow-lifecycle/utils/compute-agent-execution-fingerprint.util';
import { computeLogicFunctionExecutionFingerprint } from 'src/modules/workflow/application-workflow-lifecycle/utils/compute-logic-function-execution-fingerprint.util';
import { getWorkflowStepsExecutionDependencies } from 'src/modules/workflow/application-workflow-lifecycle/utils/get-workflow-steps-execution-dependencies.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const hasWorkflowStepPinnedDependencyChanged = ({
  step,
  pinnedDependencies,
  flatLogicFunctionMaps,
  flatAgentMaps,
}: {
  step: WorkflowAction;
  pinnedDependencies: WorkflowRunPinnedDependencies;
} & Pick<
  AllFlatEntityMaps,
  'flatLogicFunctionMaps' | 'flatAgentMaps'
>): boolean => {
  const { logicFunctionIds, agentIds } = getWorkflowStepsExecutionDependencies([
    step,
  ]);

  const hasLogicFunctionChanged = logicFunctionIds.some((logicFunctionId) => {
    const flatLogicFunction = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: logicFunctionId,
      flatEntityMaps: flatLogicFunctionMaps,
    });

    return (
      !isDefined(flatLogicFunction) ||
      isDefined(flatLogicFunction.deletedAt) ||
      computeLogicFunctionExecutionFingerprint(flatLogicFunction) !==
        pinnedDependencies.logicFunctionFingerprintById[logicFunctionId]
    );
  });

  const hasAgentChanged = agentIds.some((agentId) => {
    const flatAgent = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: agentId,
      flatEntityMaps: flatAgentMaps,
    });

    return (
      !isDefined(flatAgent) ||
      isDefined(flatAgent.deletedAt) ||
      computeAgentExecutionFingerprint(flatAgent) !==
        pinnedDependencies.agentFingerprintById[agentId]
    );
  });

  return hasLogicFunctionChanged || hasAgentChanged;
};
