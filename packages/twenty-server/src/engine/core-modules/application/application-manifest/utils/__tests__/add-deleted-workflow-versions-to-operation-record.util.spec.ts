import { addDeletedWorkflowVersionsToOperationRecord } from 'src/engine/core-modules/application/application-manifest/utils/add-deleted-workflow-versions-to-operation-record.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';

const removedVersion = {
  id: 'removed-version-id',
  universalIdentifier: 'removed-version-uid',
  coreWorkflowId: 'removed-workflow-id',
};

const keptVersion = {
  id: 'kept-version-id',
  universalIdentifier: 'kept-version-uid',
  coreWorkflowId: 'kept-workflow-id',
};

const fromAllFlatEntityMaps = {
  flatWorkflowMaps: {
    byUniversalIdentifier: {
      'removed-workflow-uid': {
        id: 'removed-workflow-id',
        universalIdentifier: 'removed-workflow-uid',
      },
      'kept-workflow-uid': {
        id: 'kept-workflow-id',
        universalIdentifier: 'kept-workflow-uid',
      },
    },
  },
  flatWorkflowVersionMaps: {
    byUniversalIdentifier: {
      'removed-version-uid': removedVersion,
      'kept-version-uid': keptVersion,
    },
  },
} as unknown as Pick<
  AllFlatEntityMaps,
  'flatWorkflowMaps' | 'flatWorkflowVersionMaps'
>;

describe('addDeletedWorkflowVersionsToOperationRecord', () => {
  it('deletes the versions of a deleted workflow along with it', () => {
    const operationRecord = {
      workflow: {
        flatEntityToCreate: {},
        flatEntityToUpdate: {},
        flatEntityToDelete: { 'removed-workflow-uid': {} },
      },
    } as unknown as AllFlatEntityOperationRecordByMetadataName;

    expect(
      Object.keys(
        addDeletedWorkflowVersionsToOperationRecord({
          fromAllFlatEntityMaps,
          allFlatEntityOperationRecordByMetadataName: operationRecord,
        }).workflowVersion?.flatEntityToDelete ?? {},
      ),
    ).toEqual(['removed-version-uid']);
  });

  it('leaves the record unchanged when no workflow is deleted', () => {
    const operationRecord = {
      workflow: {
        flatEntityToCreate: {},
        flatEntityToUpdate: {},
        flatEntityToDelete: {},
      },
    } as unknown as AllFlatEntityOperationRecordByMetadataName;

    expect(
      addDeletedWorkflowVersionsToOperationRecord({
        fromAllFlatEntityMaps,
        allFlatEntityOperationRecordByMetadataName: operationRecord,
      }),
    ).toBe(operationRecord);
  });
});
