import Constants from "expo-constants";
const { manifest } = Constants;
import axios, { AxiosRequestConfig } from "axios";
import _ from "lodash";

// const apiUrl = process.env.API_URL;
export const apiUrl =
  typeof manifest.packagerOpts === `object` && manifest.packagerOpts.dev
    ? `http://${manifest.debuggerHost?.split(`:`).shift()?.concat(`:5000`)}`
    : `http://unboxdev.ecs.baylor.edu:5000`;

const api = axios.create({
  baseURL: apiUrl,
});

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
  type: string;
  language: string;
};

export const createSurveyV2 = async (
  surveyLanguage: string,
  surveyType: string,
  cityName?: string,

  onFail: (e: any) => void = console.log
) => {
  console.log(
    "language: ",
    surveyLanguage,
    " type: ",
    surveyType,
    " city: ",
    cityName
  );
  console.log("set survey language to: ", surveyLanguage);
  const data: CreateSurveyResponse = await request(
    {
      method: "GET",
      url: "/api/create/survey/",
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
