import React, { useState } from "react";
import { Button, FAB, Title } from "react-native-paper";
import { StyleSheet, useColorScheme, View, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { RootNavigationProp } from "../../types";
import { DarkTheme, DefaultTheme } from "../../constants/Colors";
// @ts-ignore
import { Tooltip, Text } from "react-native-elements";
import DropDownPicker from "react-native-dropdown-picker";

export default function OptionsScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? DarkTheme : DefaultTheme;
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState("");
  const [items, setItems] = useState([
    { label: "🇺🇸 - English", value: "eng" },
    { label: "🇯🇵 - 日本語", value: "ja" },
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.organizerArea}>
        <DropDownPicker
          style={styles.languagePicker}
          containerStyle={styles.languagePicker}
          open={open}
          value={language}
          items={items}
          setOpen={setOpen}
          setValue={setLanguage}
          setItems={setItems}
          placeholder={"Language"}
        />
        <View style={{ flexDirection: "row" }}>
          <Title
            style={{
              fontSize: 30,
              fontWeight: "bold",
              color: theme.colors.darkText,
              marginLeft: 16,
            }}
          >
            Moderator
          </Title>

          {
            // @ts-ignore
            <Tooltip
              backgroundColor={"#d2d5d9"}
              height={250}
              width={300}
              toggleOnPress={true}
              withOverlay={false}
              popover={
                <View>
                  <Text>
                    Moderators are able to control surveys for users and view
                    data as they are completed.
                  </Text>
                  <Text></Text>
                  <Text></Text>
                  <Text>
                    "New Survey" generates a new session code for a survey that
                    can be distributed to users requested to take the survey.
                  </Text>
                  <Text></Text>
                  <Text></Text>
                  <Text>
                    "Moderate Survey" allows a moderator to control and view an
                    existing survey with a previously generated session code.
                  </Text>
                </View>
              }
            >
              <Image
                source={require("../../assets/images/info.png")}
                style={{ width: 20, height: 20 }}
              />
            </Tooltip>
          }
        </View>
        <View style={styles.organizerButtons}>
          <FAB
            icon="plus"
            label="New Survey"
            style={{
              backgroundColor: theme.colors.confirm,
              width: "55%",
            }}
            color={theme.colors.surface}
            onPress={() => navigation.navigate("Generate")}
          />

          <FAB
            icon="account-arrow-right"
            label="Moderate Survey"
            color={theme.colors.surface}
            style={{ backgroundColor: theme.colors.primary, width: "55%" }}
            onPress={() => navigation.navigate("ModerateExisting")}
          >
            Join
          </FAB>
        </View>
      </View>

      <View style={styles.userArea}>
        <View style={{ flexDirection: "row" }}>
          <Title
            style={{
              fontSize: 30,
              fontWeight: "bold",
              color: theme.colors.darkText,
              marginLeft: 16,
            }}
          >
            User
          </Title>
          {
            // @ts-ignore
            <Tooltip
              backgroundColor={"#d2d5d9"}
              height={150}
              width={300}
              popover={
                <View>
                  <Text>Users are able to take a survey.</Text>
                  <Text></Text>
                  <Text></Text>
                  <Text>
                    "Take Survey" requires a session code that is given to the
                    moderator.
                  </Text>
                </View>
              }
            >
              <Image
                source={require("../../assets/images/info.png")}
                style={{ width: 20, height: 20, justifyContent: "center" }}
              />
            </Tooltip>
          }
        </View>
        <View style={styles.userButtons}>
          <FAB
            color={theme.colors.surface}
            icon="account-arrow-right"
            label="Take Survey"
            style={{
              backgroundColor: theme.colors.primary,
              width: "55%",
            }}
            onPress={() => navigation.navigate("Join")}
          />
        </View>
      </View>

      <View style={styles.quickStartArea}>
        <Button
          style={{ marginBottom: 40 }}
          // @ts-ignore
          onPress={() => navigation.navigate("QuickStart")}
        >
          <Text style={{ fontSize: 17, color: "#3498db" }}>
            Quick Start Guide
          </Text>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  organizerArea: {
    height: "50%",
    marginTop: "4%",
    width: "100%",
  },
  userArea: {
    height: "30%",
    width: "100%",
  },
  quickStartArea: {
    height: "20%",
    width: "100%",
  },
  userButtons: {
    height: "90%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  organizerButtons: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-evenly",
    height: "90%",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "black",
    marginLeft: 16,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  image: {
    height: 15,
    width: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  languagePicker: {
    width: "60%",
    marginLeft: "38%",
  },
  languagePickerInside: {
    width: "100%",
  },
});
