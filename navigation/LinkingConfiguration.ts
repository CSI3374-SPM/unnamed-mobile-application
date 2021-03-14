import * as Linking from "expo-linking";

export default {
  prefixes: [Linking.makeUrl("/")],
  config: {
    screens: {
      Organizer: {
        screens: {
          Organizer: "organizer",
          Email: "email",
        },
      },
      Landing: {
        screens: {
          Generate: "generate",
          Join: "join",
        },
      },
      Root: {
        screens: {
          TabOne: {
            screens: {
              TabOneScreen: "one",
            },
          },
          TabTwo: {
            screens: {
              TabTwoScreen: "two",
            },
          },
        },
      },
      NotFound: "*",
    },
  },
};
