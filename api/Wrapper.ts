import Constants from "expo-constants";
const { manifest } = Constants;
import axios, { AxiosRequestConfig } from "axios";
import _ from "lodash";
import surveySlice, {
  SurveyProps,
  SurveyResponse,
} from "../store/survey/SurveyReducer";
import io from "socket.io-client";
import { newSurvey } from "../components/surveys/SurveyGenerator";
import { useEffect, useState } from "react"; //May need to still pass in Question and Survey

// const apiUrl = process.env.API_URL;
export const apiUrl = `http://unboxdev.ecs.baylor.edu:5000`;

const api = axios.create({
  baseURL: apiUrl,
});
//Add map or array list to store surveys
//export list/map that is accessed from each survey

function setUpSurvey(surveyLanguage: string) {
  const [language, setLanguage] = useState("eng");
  setLanguage(surveyLanguage);
  let survey = newSurvey(language, "who");
}

//Figure out way to make not constant
const survey = newSurvey("eng", "who");
//Figure out way to make not constant. May not need to change.

// @ts-ignore
export const questions = survey.questions;
const makeJustification = (justification?: string | null) => {
  return _.isUndefined(justification) || _.isNull(justification)
    ? "No response given"
    : justification;
};

/**
 * Send a request to the API with the given configuration
 *
 * @param config The request configuration
 * @param onFail A callback to do any desired error handling
 */
const request = async (
  config: AxiosRequestConfig,
  onFail: (e: any) => void = console.log
) => {
  try {
    const response = await api.request(config);
    if (!_.isUndefined(response.data)) {
      return response.data;
    } else {
      return null;
    }
  } catch (e) {
    onFail(e);
    return null;
  }
};

export interface ApiResponse {
  status: "OK" | "ERROR";
}

export type CreateSurveyResponse = ApiResponse & {
  id: string;
  city: string;
};

/**
 * Create a survey and return the survey ID.
 *
 * @param city_name The name of the city to create the survey for
 * @param onFail A callback to do any desired error handling
 */
export const createSurvey = async (
  surveyLanguage: string,
  surveyType: string,
  cityName?: string,

  onFail: (e: any) => void = console.log
) => {
  console.log(
    "Language: ",
    surveyLanguage,
    " type: ",
    surveyType,
    " city: ",
    cityName
  );
  setUpSurvey(surveyLanguage);
  console.log("set survey language to: ", surveyLanguage);
  const data: CreateSurveyResponse = await request(
    {
      method: "GET",
      url: "/api/create/survey",
      // TODO: Update parameters to match database
      params: {
        city_name: cityName,
        survey_language: surveyLanguage,
        survey_type: surveyType,
      },
    },
    onFail
  );
  if (!_.isNull(data)) {
    return data;
  }
  return null;
};

/**
 * Fetch the results of a survey.
 *
 * @param surveyId The survey's ID we are getting results from
 * @param onFail A callback to do any desired error handling
 */
export const fetchSurveyResults = async (
  surveyId: string,
  onFail: (e: any) => void = console.log
) => {
  const data = await request(
    {
      method: "GET",
      url: "/api/get/responses",
      params: {
        survey_id: surveyId,
      },
    },
    onFail
  );
  if (!_.isNull(data)) {
    console.log("Data from fetch survey: ", data);
    const rawResponses: any[] = data.Data;
    if (data.status === "ERROR" || _.isUndefined(rawResponses)) return null;

    // @ts-ignore
    const results = rawResponses.map((rawResults) => {
      return Object.keys(rawResults)
        .map((key) => {
          // Find the question with the right key in the questions
          const question = questions.find(
            (question) => question.question === key
          );
          if (_.isUndefined(question)) {
            return null;
          }

          // Get the question string (e.g. 'A.1.1') and find the
          // corresponding justification key in the raw results
          let qNum = question.question.split(" ")[0];
          const justificationKey = Object.keys(rawResults).find(
            (justification) =>
              justification.startsWith("Option:") &&
              justification.endsWith(qNum)
          );
          if (_.isUndefined(justificationKey)) {
            return null;
          }

          // Get the justification and score
          const justification: string = rawResults[justificationKey];
          const score: number = parseInt(rawResults[key]);

          const index = questions.indexOf(question);
          const response: SurveyResponse = {
            questionIndex: index,
            score,
            justification:
              justification === "No response given" ? undefined : justification,
          };
          return response;
        })
        .filter((response): response is SurveyResponse => !_.isNull(response));
    });

    return results;
  }
  return null;
};

export const closeResultsSocket = (socket: SocketIOClient.Socket) => {
  socket.off("survey_responses_updated");
  closeSocket(socket);
};

export const fetchSurveyResultsStream = (
  surveyId: string,
  callback: (results: SurveyResponse[][] | null) => void,
  onFail: (socket: SocketIOClient.Socket) => void = closeResultsSocket
) => {
  const socket = makeSocket();
  socket.on("connect", () => {
    console.log("connected");
    socket.emit("survey_responses_subscribe", {
      surveyId,
    });
  });

  socket.on("survey_responses_updated", (rawData: any) => {
    //console.log("results updated");
    //console.log(rawData);
    if (!_.isNull(rawData)) {
      const rawResponses: any[] = rawData.Data;
      if (rawData.status === "ERROR" || _.isUndefined(rawResponses)) {
        socket.emit("survey_responses_unsubscribe", {
          surveyId,
        });
        onFail(socket);
      }

      // @ts-ignore
      const results = rawResponses.map((rawResults) => {
        return Object.keys(rawResults)
          .map((key) => {
            //console.log("Raw results: ", rawResults);
            // Find the question with the right key in the questions
            const question = questions.find(
              (question) => question.question === key
            );
            if (_.isUndefined(question)) {
              return null;
            }

            // Get the question string (e.g. 'A.1.1') and find the
            // corresponding justification key in the raw results
            let qNum = question.question.split(" ")[0];
            const justificationKey = Object.keys(rawResults).find(
              (justification) =>
                justification.startsWith("Option:") &&
                justification.endsWith(qNum)
            );
            if (_.isUndefined(justificationKey)) {
              return null;
            }

            // Get the justification and score
            const justification: string = rawResults[justificationKey];
            const score: number = parseInt(rawResults[key]);

            const index = questions.indexOf(question);
            const response: SurveyResponse = {
              questionIndex: index,
              score,
              justification:
                justification === "No response given"
                  ? undefined
                  : justification,
            };
            return response;
          })
          .filter(
            (response): response is SurveyResponse => !_.isNull(response)
          );
      });

      callback(results);
    } else {
      socket.emit("survey_responses_unsubscribe", {
        surveyId,
      });
      onFail(socket);
    }
  });

  return socket;
};

/**
 * Submit all the answers to a survey.
 *
 * @param surveyId The survey's ID we are getting results from
 * @param responses The question responses
 * @param responseId The response ID from the previous response addition request.
 * @param onFail A callback to do any desired error handling
 */
export const addSurveyResponse = async (
  surveyId: string,
  responses: SurveyResponse[],
  responseId: string | null,
  onFail: (e: any) => void = console.log
) => {
  let convertedResponses = {};
  responses.map((r) => convertResponse(r, convertedResponses));
  const data = await request(
    {
      method: "POST",
      url: `/api/create/response/${surveyId}`,
      data: {
        response_id: responseId,
        ...convertedResponses,
      },
      headers: {
        "Content-Type": "application/json",
      },
    },
    onFail
  );
  if (_.isNull(data) || data.status !== "OK") {
    onFail("Survey response creation failed");
    return null;
  }

  // Return the response ID from the endpoint so that
  // subsequent requests can take advantage of it
  // for grouping answers.
  const newResponseId: string = data.response_id;
  return newResponseId;
};

const convertResponse = (response: SurveyResponse, map: any) => {
  const question = questions[response.questionIndex];
  map[question.question] = response.score;
  map[question.justification] = makeJustification(response.justification);
};

export const sendEmails = async (
  emails: string[],
  body: string,
  onFail: (e: any) => void = console.log
) => {
  if (body.match("undefined")) {
    onFail("The body contained an undefined URL: \n" + body);
    return;
  }
  const data = await request(
    {
      method: "POST",
      url: `/api/send/emails`,
      data: {
        recipients: emails,
        body,
      },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    },
    onFail
  );
  if (_.isNull(data) || data.status !== "OK") {
    onFail("Failed to send emails");
  }
};

// Set the current question number to the one provided
export const addSurveyEmail = async (
  surveyId: string,
  email: string,
  onFail: (e: any) => void = console.log
) => {
  const data = await request(
    {
      method: "POST",
      url: `/api/survey/${surveyId}/add/email`,
      data: {
        email,
      },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    },
    onFail
  );
  if (_.isNull(data) || data.status !== "OK") {
    onFail("Failed to add email");
    return null;
  }
  return {
    status: data.status,
    email: data.email,
    surveyId: data.survey_id,
  };
};

export type SurveyProgressResponse = ApiResponse & {
  currentQuestion?: number;
  surveyId?: string;
};

// Returns the current question number (beginning at 1, incrementing by 1)
export const getSurveyProgress = async (
  surveyId: string,
  onFail: (e: any) => void = console.log
): Promise<SurveyProgressResponse | null> => {
  const data = await request(
    {
      method: "GET",
      url: `/api/survey/${surveyId}/progress`,
      headers: {
        Accept: "application/json",
      },
    },
    onFail
  );

  if (_.isNull(data) || data.status !== "OK") {
    onFail("Failed to send emails");
    return null;
  }
  return {
    status: data.status,
    currentQuestion: data.currentQuestion,
    surveyId: data.survey_id,
  };
};

const makeSocket = () => {
  return io(apiUrl, { transports: ["websocket"], timeout: 30000 });
};

const closeSocket = (socket: SocketIOClient.Socket) => {
  console.log("WebSocket connection closing");
  socket.off("connect");
  socket.off("disconnect");
  socket.close();
};

export const closeEmailsSocket = (socket: SocketIOClient.Socket) => {
  socket.off("survy_emails_updated");
  closeSocket(socket);
};

export const getSurveyEmailsStream = (
  surveyId: string,
  callback: (email: string) => void,
  onFail: (socket: SocketIOClient.Socket) => void = closeEmailsSocket
) => {
  const socket = makeSocket();
  socket.on("connect", () => {
    console.log("connected");
    socket.emit("survey_emails_subscribe", {
      surveyId,
    });
  });

  socket.on("survey_email_added", (rawData: any) => {
    console.log("got email update");
    console.log(rawData);
    if (_.isNull(rawData) || rawData.status !== "OK") {
      socket.emit("survey_emails_unsubscribe", {
        surveyId,
      });
      onFail(socket);
    }
    let data = {
      status: rawData.status,
      email: rawData.email,
      surveyId: rawData.survey_id,
    };
    if (!_.isUndefined(data.email)) {
      callback(data.email);
    }
  });

  return socket;
};

export const closeProgressSocket = (socket: SocketIOClient.Socket) => {
  socket.off("survey_progress_updated");
  closeSocket(socket);
};

export const getSurveyProgressStream = (
  surveyId: string,
  callback: (currentProgress: number) => void,
  onFail: (socket: SocketIOClient.Socket) => void = closeProgressSocket
) => {
  const socket = makeSocket();
  socket.on("connect", () => {
    console.log("connected");
    socket.emit("survey_progress_subscribe", {
      surveyId,
    });
  });

  socket.on("survey_progress_updated", (rawData: any) => {
    console.log("got prog update");
    console.log(rawData);
    if (_.isNull(rawData) || rawData.status !== "OK") {
      socket.emit("survey_progress_unsubscribe", {
        surveyId,
      });
      onFail(socket);
    }
    let data: SurveyProgressResponse = {
      status: rawData.status,
      currentQuestion: rawData.currentQuestion,
      surveyId: rawData.survey_id,
    };
    if (!_.isUndefined(data.currentQuestion)) {
      callback(data.currentQuestion);
    }
  });

  return socket;
};

// Set the current question number to the one provided
export const updateSurveyProgress = async (
  surveyId: string,
  currentQuestion: number,
  onFail: (e: any) => void = console.log
): Promise<SurveyProgressResponse | null> => {
  const data = await request(
    {
      method: "POST",
      url: `/api/survey/${surveyId}/progress/update`,
      data: {
        currentQuestion,
      },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    },
    onFail
  );
  if (_.isNull(data) || data.status !== "OK") {
    onFail("Failed to send emails");
    return null;
  }
  return {
    status: data.status,
    currentQuestion: data.currentQuestion,
    surveyId: data.survey_id,
  };
};

const getSurveyLanguage = async (
  surveyId: string,
  onFail: (e: any) => void = console.log
) => {
  const data = await request(
    {
      method: "GET",
      url: `/api/survey/${surveyId}}/language`,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    },
    onFail
  );
  if (_.isNull(data) || data.status !== "OK") {
    onFail("Failed to get survey language");
    return null;
  }
  return { surveyLanguage: data.survey_language };
};
