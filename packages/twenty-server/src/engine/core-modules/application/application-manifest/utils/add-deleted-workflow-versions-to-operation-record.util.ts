import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';

export const addDeletedWorkflowVersionsToOperationRecord = ({
  fromAllFlatEntityMaps,
  allFlatEntityOperationRecordByMetadataName,
}: {
  fromAllFlatEntityMaps: Pick<
    AllFlatEntityMaps,
    'flatWorkflowMaps' | 'flatWorkflowVersionMaps'
  >;
  allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
}): AllFlatEntityOperationRecordByMetadataName => {
  const deletedWorkflowIds = new Set(
    Object.keys(
      allFlatEntityOperationRecordByMetadataName.workflow?.flatEntityToDelete ??
        {},
    )
      .map(
        (universalIdentifier) =>
          fromAllFlatEntityMaps.flatWorkflowMaps.byUniversalIdentifier[
            universalIdentifier
          ]?.id,
      )
      .filter(isDefined),
  );

  if (deletedWorkflowIds.size === 0) {
    return allFlatEntityOperationRecordByMetadataName;
  }

  const workflowVersionsToDelete = Object.fromEntries(
    Object.values(
      fromAllFlatEntityMaps.flatWorkflowVersionMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        ({ coreWorkflowId }) =>
          isDefined(coreWorkflowId) && deletedWorkflowIds.has(coreWorkflowId),
      )
      .map((flatWorkflowVersion) => [
        flatWorkflowVersion.universalIdentifier,
        flatWorkflowVersion,
      ]),
  );

  const workflowVersionOperations =
    allFlatEntityOperationRecordByMetadataName.workflowVersion;

  return {
    ...allFlatEntityOperationRecordByMetadataName,
    workflowVersion: {
      flatEntityToCreate: workflowVersionOperations?.flatEntityToCreate ?? {},
      flatEntityToUpdate: workflowVersionOperations?.flatEntityToUpdate ?? {},
      flatEntityToDelete: {
        ...workflowVersionOperations?.flatEntityToDelete,
        ...workflowVersionsToDelete,
      },
    },
  };
};
