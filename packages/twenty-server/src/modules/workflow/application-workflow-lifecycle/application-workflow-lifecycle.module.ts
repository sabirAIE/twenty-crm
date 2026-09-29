import { Module } from '@nestjs/common';

import { WorkspaceManyOrAllFlatEntityMapsCacheModule } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.module';
import { ApplicationWorkflowLifecycleWorkspaceService } from 'src/modules/workflow/application-workflow-lifecycle/services/application-workflow-lifecycle.workspace-service';
import { WorkflowRunPinnedDependenciesService } from 'src/modules/workflow/application-workflow-lifecycle/services/workflow-run-pinned-dependencies.service';
import { WorkflowRunQueueModule } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workflow-run-queue.module';

@Module({
  imports: [
    WorkspaceManyOrAllFlatEntityMapsCacheModule,
    WorkflowRunQueueModule,
  ],
  providers: [
    ApplicationWorkflowLifecycleWorkspaceService,
    WorkflowRunPinnedDependenciesService,
  ],
  exports: [
    ApplicationWorkflowLifecycleWorkspaceService,
    WorkflowRunPinnedDependenciesService,
  ],
})
export class ApplicationWorkflowLifecycleModule {}
