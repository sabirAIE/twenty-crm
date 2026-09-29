import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type WorkflowRunPinnedDependencies } from 'src/modules/workflow/application-workflow-lifecycle/types/workflow-run-pinned-dependencies.type';
import { computeWorkflowRunPinnedDependencies } from 'src/modules/workflow/application-workflow-lifecycle/utils/compute-workflow-run-pinned-dependencies.util';
import { getWorkflowStepsExecutionDependencies } from 'src/modules/workflow/application-workflow-lifecycle/utils/get-workflow-steps-execution-dependencies.util';
import { hasWorkflowStepPinnedDependencyChanged } from 'src/modules/workflow/application-workflow-lifecycle/utils/has-workflow-step-pinned-dependency-changed.util';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

@Injectable()
export class WorkflowRunPinnedDependenciesService {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async pinDependencies({
    workspaceId,
    steps,
  }: {
    workspaceId: string;
    steps: WorkflowAction[];
  }): Promise<WorkflowRunPinnedDependencies> {
    const { flatLogicFunctionMaps, flatAgentMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps', 'flatAgentMaps'],
        },
      );

    return computeWorkflowRunPinnedDependencies({
      steps,
      flatLogicFunctionMaps,
      flatAgentMaps,
    });
  }

  async assertStepDependenciesUnchanged({
    workspaceId,
    step,
    pinnedDependencies,
  }: {
    workspaceId: string;
    step: WorkflowAction;
    pinnedDependencies?: WorkflowRunPinnedDependencies;
  }): Promise<void> {
    if (!isDefined(pinnedDependencies)) {
      return;
    }

    const { logicFunctionIds, agentIds } =
      getWorkflowStepsExecutionDependencies([step]);

    if (logicFunctionIds.length === 0 && agentIds.length === 0) {
      return;
    }

    const { flatLogicFunctionMaps, flatAgentMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps', 'flatAgentMaps'],
        },
      );

    if (
      hasWorkflowStepPinnedDependencyChanged({
        step,
        pinnedDependencies,
        flatLogicFunctionMaps,
        flatAgentMaps,
      })
    ) {
      throw new WorkflowStepExecutorException(
        `The application changed or removed what step "${step.name}" runs after this run started. Start a new run to use the current version.`,
        WorkflowStepExecutorExceptionCode.EXECUTION_DEPENDENCY_CHANGED,
      );
    }
  }
}
