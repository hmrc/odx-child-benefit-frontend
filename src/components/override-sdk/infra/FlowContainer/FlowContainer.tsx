import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, Avatar, Typography } from '@material-ui/core';
import { Utils } from '@pega/react-sdk-components/lib/components/helpers/utils';
import StoreContext from '@pega/react-sdk-components/lib/bridge/Context/StoreContext';
import DayjsUtils from '@date-io/dayjs';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';

import {
  addContainerItem,
  showBanner,
  hasContainerItems
} from '@pega/react-sdk-components/lib/components/infra/Containers/FlowContainer/helpers';
import { isContainerInitialized } from '../helpers';

import { withSimpleViewContainerRenderer } from '../SimpleView/SimpleView';

import { getComponentFromMap } from '@pega/react-sdk-components/lib/bridge/helpers/sdk_component_map';

// Remove this and use "real" PCore type once .d.ts is fixed (currently shows 3 errors)
declare const PCore: any;

// WARNING:  It is not expected that this file should be modified.  It is part of infrastructure code that works with
// Redux and creation/update of Redux containers and PConnect.  Modifying this code could have undesireable results and
// is totally at your own risk.
//

export const FlowContainer = props => {
  const pCoreConstants = PCore.getConstants();
  const PCoreVersion = PCore.getPCoreVersion();

  const Assignment = getComponentFromMap('Assignment');
  const {
    getPConnect: getPConnectOfFlowContainer,
    rootViewElement,
    getPConnectOfActiveContainerItem,
    assignmentNames,
    activeContainerItemID: itemKey
  } = props;

  const { displayOnlyFA } = useContext<any>(StoreContext);

  const pConnectOfFlowContainer = getPConnectOfFlowContainer();
  const isInitialized = isContainerInitialized(pConnectOfFlowContainer);
  const hasItems = isInitialized && hasContainerItems(pConnectOfFlowContainer);
  const getPConnect = getPConnectOfActiveContainerItem || getPConnectOfFlowContainer;

  const thePConn = getPConnect();

  const containerName = assignmentNames && assignmentNames.length > 0 ? assignmentNames[0] : '';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const [checkSvg, setCheckSvg] = useState('');
  const [buildName, setBuildName] = useState('');
  const [bShowConfirm, setShowConfirm] = useState(false);

  function getBuildName(): string {
    const ourPConn = getPConnect();
    const context = ourPConn.getContextName();
    let viewContainerName = ourPConn.getContainerName();

    if (!viewContainerName) viewContainerName = '';
    return `${context.toUpperCase()}/${viewContainerName.toUpperCase()}`;
  }

  function initComponent() {
    const ourPConn = getPConnect();
    ourPConn.isBoundToState();
    setBuildName(getBuildName());
  }

  useEffect(() => {
    initComponent();
  }, []);

  useEffect(() => {
    if (isInitialized && pConnectOfFlowContainer.getMetadata().children && !hasItems) {
      // ensuring not to add container items, if container already has items
      // because during multi doc mode, we will have container items already in store
      addContainerItem(pConnectOfFlowContainer);
    }
  }, [isInitialized, hasItems]);

  function isCaseWideLocalAction() {
    const ourPConn = getPConnect();

    const actionID = ourPConn.getValue(pCoreConstants.CASE_INFO.ACTIVE_ACTION_ID);
    const caseActions = ourPConn.getValue(pCoreConstants.CASE_INFO.AVAILABLEACTIONS);
    let bCaseWideAction = false;
    if (caseActions && actionID) {
      const actionObj = caseActions.find(caseAction => caseAction.ID === actionID);
      if (actionObj) {
        bCaseWideAction = actionObj.type === 'Case';
      }
    }
    return bCaseWideAction;
  }

  function hasChildCaseAssignments() {
    const ourPConn = getPConnect();

    const childCases = ourPConn.getValue(pCoreConstants.CASE_INFO.CHILD_ASSIGNMENTS);

    // eslint-disable-next-line sonarjs/prefer-single-boolean-return
    if (childCases && childCases.length > 0) {
      return true;
    }
    return false;
  }

  function hasAssignments() {
    const ourPConn = getPConnect();

    let bHasAssignments = false;
    const assignmentsList: Array<any> = ourPConn.getValue(
      pCoreConstants.CASE_INFO.D_CASE_ASSIGNMENTS_RESULTS,
      ''
    );

    const isEmbedded = window.location.href.includes('embedded');
    let bAssignmentsForThisOperator = false;

    // 8.7 includes assignments in Assignments List that may be assigned to
    //  a different operator. So, see if there are any assignments for
    //  the current operator
    if (PCoreVersion?.includes('8.7') || isEmbedded) {
      const thisOperator = PCore.getEnvironmentInfo().getOperatorIdentifier();
      for (const assignment of assignmentsList) {
        if (assignment['assigneeInfo']['ID'] === thisOperator) {
          bAssignmentsForThisOperator = true;
        }
      }
    } else {
      bAssignmentsForThisOperator = true;
    }
    // Bail out if there isn't an assignmentsList
    if (!assignmentsList) {
      return bHasAssignments;
    }

    const bHasChildCaseAssignments = hasChildCaseAssignments();

    if (bAssignmentsForThisOperator || bHasChildCaseAssignments || isCaseWideLocalAction()) {
      bHasAssignments = true;
    }

    return bHasAssignments;
  }

  // From SDK-WC updateSelf - so do this in useEffect that's run only when the props change...
  useEffect(() => {
    setBuildName(getBuildName());

    // let loadingInfo: any;
    // try {
    //   loadingInfo = thePConn.getLoadingStatus();
    // } catch (ex) {
    //   // eslint-disable-next-line no-console
    //   console.error(`${thePConn.getComponentName()}: loadingInfo catch block`);
    // }

    // if (!loadingInfo) {
    //   // turn off spinner
    //   // this.psService.sendMessage(false);
    // }

    if (!hasAssignments()) {
      setShowConfirm(true);

      // publish this "assignmentFinished" for mashup, need to get approved as a standard
      PCore.getPubSubUtils().publish('assignmentFinished');
    } else {
      setShowConfirm(false);
    }
  }, [props]);

  const caseId = thePConn.getCaseSummary().content.pyID;
  const urgency = getPConnect().getCaseSummary().assignments
    ? getPConnect().getCaseSummary().assignments?.[0].urgency
    : '';
  const operatorInitials = Utils.getInitials(PCore.getEnvironmentInfo().getOperatorName());
  let instructionText = thePConn.getCaseSummary()?.assignments?.[0]?.instructions;
  if (instructionText === undefined) {
    instructionText = '';
  }

  const bShowBanner = showBanner(getPConnect);

  return (
    <div id={buildName}>
      {!bShowConfirm && !displayOnlyFA ? (
        <Card>
          <CardHeader
            title={<Typography variant='h6'>{containerName}</Typography>}
            subheader={`Task in ${caseId} \u2022 Priority ${urgency}`}
            avatar={<Avatar>{operatorInitials}</Avatar>}
          ></CardHeader>
          {instructionText !== '' ? (
            <Typography variant='caption'>{instructionText}</Typography>
          ) : null}
          <MuiPickersUtilsProvider utils={DayjsUtils}>
            <Assignment getPConnect={getPConnect} itemKey={itemKey}>
              {[rootViewElement]}
            </Assignment>
          </MuiPickersUtilsProvider>
        </Card>
      ) : (
        <div>
          {instructionText !== '' ? (
            <Typography variant='caption'>{instructionText}</Typography>
          ) : null}
          <Assignment getPConnect={getPConnect} itemKey={itemKey}>
            {[rootViewElement]}
          </Assignment>
        </div>
      )}
      {bShowConfirm && bShowBanner && <div>{[rootViewElement]}</div>}
    </div>
  );
};

export default withSimpleViewContainerRenderer(FlowContainer);

FlowContainer.defaultProps = {
  children: null,
  getPConnect: null,
  name: '',
  pageMessages: null
};

FlowContainer.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  children: PropTypes.node,
  getPConnect: PropTypes.func,
  // eslint-disable-next-line react/no-unused-prop-types
  name: PropTypes.string,
  // eslint-disable-next-line react/no-unused-prop-types
  pageMessages: PropTypes.arrayOf(PropTypes.any)
};
