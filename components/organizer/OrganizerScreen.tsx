import React, { useEffect, useState } from "react";
import { Button, Text, List } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import {
  fetchSurveyResults,
  getSurveyProgress,
  updateSurveyProgress,
} from "../../api/Wrapper";
import { connect } from "react-redux";
import FinishButton from "../log_out/FinishButton";
import { useNavigation } from "@react-navigation/core";
import { RootNavigationProp } from "../../types";
import {
  mapDispatchToProps,
  mapStateToProps,
  SurveyProps,
  SurveyResponse,
} from "../../store/survey/SurveyReducer";
import SurveyRadarGraph from "../SurveyRadarGraph";
import { ScrollView } from "react-native-gesture-handler";
import _ from "lodash";
import SurveyBarGraph from "../SurveyBarGraph";

function OrganizerScreen(props: SurveyProps) {
  const navigator = useNavigation<RootNavigationProp>();
  // @ts-ignore
  const [results, setResults]: [
    SurveyResponse[][] | null,
    (r: SurveyResponse[][] | null) => void
  ] = useState(null);
  const [expanded, setExpanded] = React.useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const handlePress = () => setExpanded(!expanded);

  const requestResults = async () => {
    let resp = await fetchSurveyResults(props.data.authentication.surveyId);
    setResults(resp);
  };

  const requestCurrentQuestion = async () => {
    let surveyProgress = await getSurveyProgress(
      props.data.authentication.surveyId
    );
    if (!_.isNull(surveyProgress)) {
      let currentQuestion = surveyProgress.currentQuestion;
      if (currentQuestion) {
        setCurrentQuestion(currentQuestion);
      }
    }
  };

  useEffect(() => {
    requestResults();
    requestCurrentQuestion();
  }, [props.data.authentication.surveyId]);

  useEffect(() => {
    const timer = setInterval(requestResults, 5000);
    return () => clearInterval(timer);
  }, [props.data.authentication.surveyId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Survey ID: {props.data.authentication.surveyId}
      </Text>
      <Text style={styles.title}>
        Responders:
        {_.isNull(results)
          ? 0 // @ts-ignore
          : results.length}
      </Text>
      <Button
        mode="contained"
        onPress={() => pushNextQuestion(props, setCurrentQuestion)}
      >
        Next
      </Button>
      <ScrollView>
        <SurveyRadarGraph surveyData={results} />
        <List.Accordion
          title="Responses for Question"
          left={(props) => <List.Icon {...props} icon="folder" />}
        >
          <SurveyBarGraph surveyData={results} />
        </List.Accordion>
        <List.Section title="Justification">
          <List.Accordion
            title={`Justifications: Question ${currentQuestion}`}
            left={(props) => <List.Icon {...props} icon="folder" />}
          >
            {_.isNull(results)
              ? "0" // @ts-ignore
              : results.map((ID: SurveyResponse[], respIndex: number) =>
                  ID.filter(
                    (res: SurveyResponse) =>
                      res.questionIndex === currentQuestion - 1 &&
                      !_.isUndefined(res.justification)
                  ).map((res: SurveyResponse, ansIndex: number) => {
                    return (
                      <List.Item
                        title={res.justification}
                        key={`justification-${respIndex}-${ansIndex}`}
                      />
                    );
                  })
                )}
          </List.Accordion>
        </List.Section>

        <Button mode="contained" onPress={() => navigator.navigate("Email")}>
          Email Results
        </Button>
        <FinishButton />
      </ScrollView>
    </View>
  );
}

async function pushNextQuestion(
  props: SurveyProps,
  setCurrentQuestion: (n: number) => void
) {
  let surveyProgress = await getSurveyProgress(
    props.data.authentication.surveyId
  );

  if (surveyProgress != null) {
    let currentQuestion = surveyProgress.currentQuestion;
    if (currentQuestion) {
      updateSurveyProgress(
        props.data.authentication.surveyId,
        currentQuestion + 1
      );
      setCurrentQuestion(currentQuestion + 1);
    }
  }
  console.log("updated question availability");
}

export default connect(mapStateToProps, mapDispatchToProps)(OrganizerScreen);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-evenly",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
