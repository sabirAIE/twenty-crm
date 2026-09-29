export type ChangedApplicationWorkflowDependencies = {
  removedWorkflowIds: Set<string>;
  changedLogicFunctionLabelById: Map<string, string>;
  changedAgentLabelById: Map<string, string>;
};
