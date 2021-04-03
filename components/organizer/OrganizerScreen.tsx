import React, { useCallback, useEffect, useState } from "react";
import { Button, Text, List, Subheading } from "react-native-paper";
import { StyleSheet, View } from "react-native";
import {
  fetchSurveyResults,
  getSurveyProgress,
  updateSurveyProgress,
  questions,
  fetchSurveyResultsStream,
  closeResultsSocket,
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
import { useFocusEffect } from "@react-navigation/native";

function OrganizerScreen(props: SurveyProps) {
  const navigator = useNavigation<RootNavigationProp>();
  // @ts-ignore
  const [results, setResults]: [
    SurveyResponse[][] | null,
    (r: SurveyResponse[][] | null) => void
  ] = useState(null);
  const [expanded, setExpanded] = React.useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [socket, setSocket]: [
    SocketIOClient.Socket | null,
    (s: SocketIOClient.Socket | null) => void
  ] = useState(null as SocketIOClient.Socket | null);
  const handlePress = () => setExpanded(!expanded);

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
    if (_.isNull(socket) && props.data.authentication.surveyId != "") {
      setSocket(
        fetchSurveyResultsStream(props.data.authentication.surveyId, setResults)
      );
      requestCurrentQuestion();
    } else if (!_.isNull(socket)) {
      closeResultsSocket(socket);
      setSocket(null);
    }
    return () => {
      if (!_.isNull(socket)) {
        console.log("results a");
        closeResultsSocket(socket);
      }
    };
  }, [props.data.authentication.surveyId]);

  useEffect(() => {
    return () => {
      if (!_.isNull(socket)) {
        console.log("results b");
        closeResultsSocket(socket);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Survey ID: {props.data.authentication.surveyId}
      </Text>
      <Text style={styles.title}>
        {"Responders: "}
        {_.isNull(results)
          ? 0 // @ts-ignore
          : results.length}
      </Text>
      <Button
        style={styles.item}
        mode="contained"
        onPress={() => pushNextQuestion(props, setCurrentQuestion)}
      >
        Next
      </Button>
      <ScrollView>
        <SurveyRadarGraph surveyData={results} />
        <Subheading style={styles.item}>Current Question</Subheading>
        <Text style={styles.item}>
          {currentQuestion - 1 > -1 && currentQuestion - 1 < questions.length
            ? questions[currentQuestion - 1].question
            : "Could not find question"}
        </Text>
        <List.Accordion
          style={styles.item}
          title={`Response Distribution`}
          left={(props) => <List.Icon {...props} icon="folder" />}
        >
          <SurveyBarGraph
            surveyData={results}
            questionIndex={currentQuestion - 1}
          />
        </List.Accordion>
        <List.Accordion
          style={styles.item}
          title={`Justifications`}
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
                      title={
                        <Text>
                          {!_.isUndefined(res.justification)
                            ? res.justification
                            : "No justification given"}
                        </Text>
                      }
                      key={`justification-${respIndex}-${ansIndex}`}
                    />
                  );
                })
              )}
        </List.Accordion>

        <Button
          style={styles.email}
          mode="contained"
          onPress={() => navigator.navigate("Email")}
        >
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
    padding: 8,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  item: {
    padding: 4,
  },
  email: {
    marginBottom: 4,
  },
});
