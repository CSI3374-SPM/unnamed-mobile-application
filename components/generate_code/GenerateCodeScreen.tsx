import React, { useState } from "react";
import { FAB, TextInput } from "react-native-paper";
import { StyleSheet, useColorScheme, View } from "react-native";
import { createSurveyV2 } from "../../api/WrapperV2";
import { SurveyProps } from "../../store/survey/SurveyReducer";
import { DarkTheme, DefaultTheme } from "../../constants/Colors";
import DropDownPicker from "react-native-dropdown-picker";

export default function GenerateCodeScreen(props: SurveyProps) {
  const [city, setCity] = useState("");
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? DarkTheme : DefaultTheme;
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState("");
  const [items, setItems] = useState([
    { label: "🇺🇸 - English", value: "eng" },
    { label: "🇯🇵 - 日本語", value: "ja" },
  ]);

  const [openSurvey, setOpenSurvey] = useState(false);
  const [survey, setSurvey] = useState("");
  const [surveyItems, setSurveyItems] = useState([
    { label: "WHO", value: "who" },
    { label: "USAID", value: "usaid" },
  ]);

  // @ts-ignore
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
        placeholder="Survey language"
      />

      <DropDownPicker
        open={openSurvey}
        value={survey}
        items={surveyItems}
        setOpen={setOpenSurvey}
        setValue={setSurvey}
        setItems={setSurveyItems}
        placeholder="Survey Type"
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
  var surveyData = await createSurveyV2(selectedLanguage, selectedSurvey, city);
  console.log("survey data: ", surveyData);

  let id = surveyData?.id;
  if (id != null) {
    console.log("generated survey id " + id);
    // setSurvey(selectedLanguage);
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
