import React, { useState } from "react";
import { FAB, TextInput, Title } from "react-native-paper";
import { CheckBox, StyleSheet, useColorScheme, View } from "react-native";
import { fetchSurveyResults } from "../../api/Wrapper";
import { connect } from "react-redux";
import _ from "lodash";
import {
  mapDispatchToProps,
  mapStateToProps,
  SurveyProps,
} from "../../store/survey/SurveyReducer";
import { DarkTheme, DefaultTheme } from "../../constants/Colors";
import { Checkbox } from "react-native-paper";

function UserCategories(props: SurveyProps) {
  const [checked, setChecked] = React.useState(false);
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

  return (
    <View style={styles.container}>
      <Title>Please select what best describes you</Title>
      <Checkbox
        status={checked ? "checked" : "unchecked"}
        onPress={() => setChecked(!checked)}
      />
    </View>
  );
}

async function validateId(id: string, props: SurveyProps) {
  let surveyResults = await fetchSurveyResults(id);
  console.log("Survey results ", !_.isNull(surveyResults));

  if (!_.isNull(surveyResults)) {
    props.updateAuthentication({
      isOrganizer: false,
      surveyId: id,
      responseId: null,
    });
  } else {
    console.log("invalid id");
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UserCategories);

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
