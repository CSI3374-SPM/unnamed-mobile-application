import React from "react";
import { View, StyleSheet } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { Title, Text, Divider } from "react-native-paper";
import FinishButton from "../log_out/FinishButton";
import { rating } from "../question/Question";
import { questions } from "../../api/Wrapper";
import { SurveyProps } from "../../store/survey/SurveyReducer";

export default function Answer(props: SurveyProps) {
  return (
    <ScrollView>
      <View style={styles.container}>
        {props.data.responses.map((items, index) => (
          <View style={styles.item} key={`answer-${index}`}>
            <Title>ID</Title>
            <Text>{index + 1}</Text>

            <Title>Score</Title>
            <Text>{`${items.score} (${
              questions[index].descriptions[rating(items.score)]
            })`}</Text>

            <Title>Justification</Title>
            <Text>{`${
              items.justification === undefined
                ? "None provided"
                : items.justification
            }`}</Text>
            <Divider />
          </View>
        ))}
        <FinishButton
          style={{
            marginTop: 20,
            height: 50,
            marginLeft: 500,
            marginRight: 500,
            justifyContent: "center",
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    flexGrow: 1,
    padding: 12,
  },
  item: {
    marginVertical: 8,
  },
});
