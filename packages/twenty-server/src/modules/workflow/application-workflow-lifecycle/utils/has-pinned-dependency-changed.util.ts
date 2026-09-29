import { type WorkflowExecutionDependencies } from 'src/modules/workflow/application-workflow-lifecycle/types/workflow-execution-dependencies.type';
import { type WorkflowRunPinnedDependencies } from 'src/modules/workflow/application-workflow-lifecycle/types/workflow-run-pinned-dependencies.type';

export const hasPinnedDependencyChanged = ({
  dependencies,
  pinnedDependencies,
  currentDependencies,
}: {
  dependencies: WorkflowExecutionDependencies;
  pinnedDependencies: WorkflowRunPinnedDependencies;
  currentDependencies: WorkflowRunPinnedDependencies;
}): boolean =>
  dependencies.logicFunctionIds.some(
    (logicFunctionId) =>
      currentDependencies.logicFunctionFingerprintById[logicFunctionId] ===
        undefined ||
      currentDependencies.logicFunctionFingerprintById[logicFunctionId] !==
        pinnedDependencies.logicFunctionFingerprintById[logicFunctionId],
  ) ||
  dependencies.agentIds.some(
    (agentId) =>
      currentDependencies.agentFingerprintById[agentId] === undefined ||
      currentDependencies.agentFingerprintById[agentId] !==
        pinnedDependencies.agentFingerprintById[agentId],
  );
