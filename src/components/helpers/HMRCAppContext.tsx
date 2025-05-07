import { createContext } from 'react';

const DefaultFormContext = createContext({
  // Is this Default Form set to display as single question?
  displayAsSingleQuestion: false,
  // What is the name of this Default Form (should be same as name pushed to HMRCAppContext SingleQuestionDisplayDFStack)
  DFName: -1,
  // Holds assignment name incase needed for single page label
  OverrideLabelValue: '',

  // Holds DefaultForm level instruction text for use in field set instruction blocks
  instructionText: ''
});

const ErrorMsgContext = createContext({
  errorMsgs: []
});

const ReadOnlyDefaultFormContext = createContext({
  hasBeenWrapped: false
});

// Used to add bold CSS class when the autocomplete form label is not displayed in a set of inputs
export const FieldSetContext = createContext({ isInFieldSet: false });

export { DefaultFormContext, ReadOnlyDefaultFormContext, ErrorMsgContext };
