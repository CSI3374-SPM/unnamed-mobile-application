import { ActionReducerMapBuilder, createSlice } from "@reduxjs/toolkit";
import {
  SurveyActionTypes,
  SurveyAction,
  surveyReduxName,
} from "./SurveyAction";
import { Dispatch } from "redux";

// The data field for the state
export interface SurveyResponse {
  questionIndex: number;
  // Score restricted to 0 to 5
  score: number;
  justification?: string;
}

export interface LanguageData {
  // Language for rendering the survey
  surveyLanguage: string;
  // Language for rendering the UI
  UILanguage: string;
  surveyType: string;
}
// The data field for the state
export interface AuthenticationData {
  // isOrganizer boolean value
  isOrganizer: boolean;
  // id String
  surveyId: string;
  responseId: string | null;
}

interface State {
  data: SurveyData;
}

export interface SurveyData {
  responses: SurveyResponse[];
  authentication: AuthenticationData;
}

export interface SurveyProps {
  data: SurveyData;
  updateAnswer: (answer: SurveyResponse[]) => void;
  updateAuthentication: (authentication: AuthenticationData) => void;
}

// Create the example state slice
const surveySlice = createSlice({
  name: surveyReduxName,
  initialState: {
    data: {
      responses: [],
      authentication: {
        isOrganizer: false,
        surveyId: "",
        responseId: null,
      },
    },
  },
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<State>) => {
    // @ts-ignore
    builder
      .addCase(
        SurveyActionTypes.UPDATE_ANSWERS_ACTION,
        (state: State, action: SurveyAction) => {
          // @ts-ignore
          state.data.responses = action.payload;
          return state;
        }
      )
      .addCase(
        SurveyActionTypes.UPDATE_AUTH_ACTION,
        (state: State, action: SurveyAction) => {
          // @ts-ignore
          state.data.authentication = action.payload;
          return state;
        }
      );
  },
});

export function mapStateToProps(state: any, myProps: any) {
  return {
    data: state.survey.data,
  };
}

function dispatchAnswerUpdate(
  dispatch: Dispatch<SurveyAction>,
  answer: SurveyResponse[]
) {
  // Dispatch update
  dispatch({
    type: SurveyActionTypes.UPDATE_ANSWERS_ACTION,
    payload: answer,
  });
}

function dispatchAuthenticationUpdate(
  dispatch: Dispatch<SurveyAction>,
  authentication: AuthenticationData
) {
  // Dispatch update
  dispatch({
    type: SurveyActionTypes.UPDATE_AUTH_ACTION,
    payload: authentication,
  });
}

export const mapDispatchToProps = (dispatch: Dispatch<SurveyAction>) => {
  return {
    updateAnswer: (answer: SurveyResponse[]) => {
      dispatchAnswerUpdate(dispatch, answer);
    },
    updateAuthentication: (authentication: AuthenticationData) => {
      dispatchAuthenticationUpdate(dispatch, authentication);
    },
    dispatch,
  };
};

export default surveySlice;
