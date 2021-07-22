import React, { useState, useEffect } from "react";
import { SurveyResponse } from "../store/survey/SurveyReducer";
import RadarGraph, { Memo } from "./RadarGraph";
import _ from "lodash";
import { questions } from "../api/Wrapper";

interface Props {
  surveyData: SurveyResponse[][] | null;
}

const computeEssentialAverages = (surveyData: SurveyResponse[][] | null) => {
  if (_.isNull(surveyData)) return [];

  const questionAvgs = questions.map((_q, i) => {
    return averageQuestionNum(surveyData, i);
  });

  let essentialAvgs: Memo = {};
  // const MAX_VAL = 5;
  const multiplier = 1; //100 / MAX_VAL;

  essentialAvgs["Essential 1"] = 
    ((questionAvgs[0] + questionAvgs[1]) / 2) * multiplier;
  essentialAvgs["Essential 2"] = 
    ((questionAvgs[2] + questionAvgs[3] + questionAvgs[4]) / 3) * multiplier;
  essentialAvgs["Essential 3"] = questionAvgs[5] * multiplier;
  essentialAvgs["Essential 4"] = questionAvgs[6] * multiplier;
  essentialAvgs["Essential 5"] = questionAvgs[7] * multiplier;
  essentialAvgs["Essential 6"] =
    ((questionAvgs[8] + questionAvgs[9]) / 2) * multiplier;
  essentialAvgs["Essential 7"] =
    ((questionAvgs[10] + questionAvgs[11] + questionAvgs[12]) / 3) * multiplier;
  essentialAvgs["Essential 8"] =
    ((questionAvgs[13] + questionAvgs[14] + questionAvgs[15]) / 3) * multiplier;
  essentialAvgs["Essential 9"] =
    ((questionAvgs[16] + questionAvgs[17] + questionAvgs[18]) / 3) * multiplier;
  essentialAvgs["Essential 10"] =
    ((questionAvgs[19] + questionAvgs[20]) / 2) * multiplier;

  Object.keys(essentialAvgs).forEach((key) => {
    if (isNaN(essentialAvgs[key])) {
      essentialAvgs[key] = 0;
    }
  });

  return [essentialAvgs];
};

const averageQuestionNum = (data: SurveyResponse[][], ndx: number) => {
  let total = 0;
  let numResp = 0;
  data.forEach((responder) => {
    const response = responder.find(
      (question) => question.questionIndex === ndx
    );
    if (!_.isUndefined(response)) {
      total += response.score;
      numResp++;
    }
  });
  return total / numResp;
};

export default function SurveyRadarGraph(props: Props) {
  // @ts-ignore
  const [data, setData]: [Memo[], (m: Memo[]) => void] = useState([]);

  useEffect(() => {
    setData(computeEssentialAverages(props.surveyData));
  }, [props.surveyData]);

  return !_.isNull(props.surveyData) &&
    data.length > 0 &&
    Object.keys(data[0]).length > 0 ? (
    <RadarGraph data={data} />
  ) : (
    <></>
  );
}
