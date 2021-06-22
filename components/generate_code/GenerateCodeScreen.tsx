import React, { useState } from "react";
import { FAB, TextInput } from "react-native-paper";
import { StyleSheet, useColorScheme, View } from "react-native";
import { createSurvey } from "../../api/Wrapper";
import { SurveyProps } from "../../store/survey/SurveyReducer";
import { DarkTheme, DefaultTheme } from "../../constants/Colors";
import DropDownPicker from "react-native-dropdown-picker";

export default function GenerateCodeScreen(props: SurveyProps) {
  const [city, setCity] = useState("");
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? DarkTheme : DefaultTheme;
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState(null);
  const [items, setItems] = useState([
    { label: "English", value: "eng" },
    { label: "Japanese", value: "ja" },
  ]);

  const [openSurvey, setOpenSurvey] = useState(false);
  const [survey, setSurvey] = useState(null);
  const [surveyItems, setSurveyItems] = useState([
    { label: "WHO", value: "who" },
    { label: "USAID", value: "usaid" },
  ]);

  return (
    <View style={styles.container}>
      <TextInput
        label="City"
        value={city}
        onChangeText={(city) => setCity(city)}
      />

      <DropDownPicker
        open={open}
        value={language}
        items={items}
        setOpen={setOpen}
        setValue={setLanguage}
        setItems={setItems}
        placeholder="Select the survey's language"
      />

      <DropDownPicker
        open={openSurvey}
        value={survey}
        items={surveyItems}
        setOpen={setOpenSurvey}
        setValue={setSurvey}
        setItems={setSurveyItems}
        placeholder="Select the survey type"
      />

      <FAB
        icon=""
        label="Create Survey"
        style={{
          backgroundColor: theme.colors.confirm,
          width: "55%",
          alignSelf: "center",
        }}
        color={theme.colors.surface}
        onPress={async () => await generateID(city, props, language, survey)}
      />
    </View>
  );
}

async function generateID(
  city: string,
  props: SurveyProps,
  selectedLanguage: string,
  selectedSurvey: string
) {
  var surveyData = await createSurvey(city);

  let id = surveyData?.id;
  if (id != null) {
    console.log("generated survey id " + id);
    console.log(
      "selected language " + selectedLanguage + " selected suvey: ",
      selectedSurvey
    );

    props.updateAuthentication({
      isOrganizer: true,
      surveyId: id,
      responseId: null,
    });
  }
}

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
