import { generateWHOSurvey, Survey } from "./Survey";

export const newSurvey = (
  surveyLanguage: string,
  surveyType: string
): Survey => {
  if (surveyType == "who") {
    return generateWHOSurvey(surveyLanguage);
  }
  return generateWHOSurvey("eng");
};
