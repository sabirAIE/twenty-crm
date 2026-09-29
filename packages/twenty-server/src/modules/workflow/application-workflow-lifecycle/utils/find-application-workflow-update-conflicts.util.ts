import { isDefined } from 'twenty-shared/utils';

import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { type ApplicationWorkflowUpdateConflict } from 'src/modules/workflow/application-workflow-lifecycle/types/application-workflow-update-conflict.type';
import { type ChangedApplicationWorkflowDependencies } from 'src/modules/workflow/application-workflow-lifecycle/types/changed-application-workflow-dependencies.type';
import { getWorkflowRunStepsThatMayStillExecute } from 'src/modules/workflow/application-workflow-lifecycle/utils/get-workflow-run-steps-that-may-still-execute.util';
import { getWorkflowStepsExecutionDependencies } from 'src/modules/workflow/application-workflow-lifecycle/utils/get-workflow-steps-execution-dependencies.util';

export const findApplicationWorkflowUpdateConflicts = ({
  activeWorkflowRuns,
  workflowNameById,
  changedDependencies,
}: {
  activeWorkflowRuns: Pick<
    WorkflowRunWorkspaceEntity,
    'coreWorkflowId' | 'state'
  >[];
  workflowNameById: Record<string, string>;
  changedDependencies: ChangedApplicationWorkflowDependencies;
}): ApplicationWorkflowUpdateConflict[] => {
  const {
    removedWorkflowIds,
    changedLogicFunctionLabelById,
    changedAgentLabelById,
  } = changedDependencies;

  const conflictByWorkflowId = new Map<
    string,
    { workflowRunCount: number; blockedChanges: Set<string> }
  >();

  for (const workflowRun of activeWorkflowRuns) {
    const { coreWorkflowId, state } = workflowRun;

    if (!isDefined(coreWorkflowId)) {
      continue;
    }

    const blockedChanges = new Set<string>();

    if (removedWorkflowIds.has(coreWorkflowId)) {
      blockedChanges.add('the workflow, which this update removes');
    } else if (isDefined(state)) {
      const { logicFunctionIds, agentIds } =
        getWorkflowStepsExecutionDependencies(
          getWorkflowRunStepsThatMayStillExecute({
            steps: state.flow.steps,
            stepInfos: state.stepInfos,
          }),
        );

      for (const logicFunctionId of logicFunctionIds) {
        const label = changedLogicFunctionLabelById.get(logicFunctionId);

        if (isDefined(label)) {
          blockedChanges.add(label);
        }
      }

      for (const agentId of agentIds) {
        const label = changedAgentLabelById.get(agentId);

        if (isDefined(label)) {
          blockedChanges.add(label);
        }
      }
    }

    if (blockedChanges.size === 0) {
      continue;
    }

    const conflict = conflictByWorkflowId.get(coreWorkflowId) ?? {
      workflowRunCount: 0,
      blockedChanges: new Set<string>(),
    };

    conflict.workflowRunCount += 1;
    blockedChanges.forEach((change) => conflict.blockedChanges.add(change));
    conflictByWorkflowId.set(coreWorkflowId, conflict);
  }

  return [...conflictByWorkflowId.entries()].map(
    ([workflowId, { workflowRunCount, blockedChanges }]) => ({
      workflowName: workflowNameById[workflowId] ?? workflowId,
      workflowRunCount,
      blockedChanges: [...blockedChanges],
    }),
  );
};
