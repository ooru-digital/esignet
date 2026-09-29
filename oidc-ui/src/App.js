import "./App.css";
import { BrowserRouter } from "react-router-dom";
import NavHeader from "./components/NavHeader";
import langConfigService from "./services/langConfigService";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import LoadingIndicator from "./common/LoadingIndicator";
import { LoadingStates as states } from "./constants/states";
import Footer from "./components/Footer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HttpError } from "./services/api.service";
import { AppRouter } from "./app/AppRouter";

function App() {
  const { i18n } = useTranslation();
  const [langOptions, setLangOptions] = useState([]);
  const [dir, setDir] = useState("");
  const [statusLoading, setStatusLoading] = useState(states.LOADING);

  // Create a client
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // set to one minutes
        retry: (failureCount, error) => {
          // Do not retry on 4xx error codes
          if (
            error instanceof HttpError &&
            String(error.code).startsWith("4")
          ) {
            return false;
          }
          return failureCount !== 3;
        },
      },
    },
  });

  //Loading rtlLangs
  useEffect(() => {
    try {
      langConfigService.getLocaleConfiguration().then((response) => {
        let lookup = {};
        let supportedLanguages = response.languages_2Letters;
        let langData = [];
        for (let lang in supportedLanguages) {
          //check to avoid duplication language labels
          if (!(supportedLanguages[lang] in lookup)) {
            lookup[supportedLanguages[lang]] = 1;
            langData.push({
              label: supportedLanguages[lang],
              value: lang,
            });
          }
        }
        i18n.changeLanguage("en");
        setDir(response.rtlLanguages.includes(i18n.language) ? "rtl" : "ltr");

        //Gets fired when changeLanguage got called.
        i18n.on("languageChanged", function (lng) {
          setDir(response.rtlLanguages.includes(lng) ? "rtl" : "ltr");
        });
        setLangOptions(langData);
        setStatusLoading(states.LOADED);
      });
    } catch (error) {
      console.error("Failed to load rtl languages!");
    }

    window.onbeforeunload = function () {
      return true;
    };
  }, []);

  let el;

  switch (statusLoading) {
    case states.LOADING:
      el = (
        <div className="h-screen flex justify-center content-center">
          <LoadingIndicator
            size="medium"
            message={"loading_msg"}
            className="align-loading-center"
          />
        </div>
      );
      break;
    case states.LOADED:
      el = (
        <div dir={dir} className="h-screen">
          <NavHeader langOptions={langOptions} />
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <AppRouter />
            </BrowserRouter>
          </QueryClientProvider>
          <Footer />
        </div>
      );
      break;
  }

  return el;
}

export default App;
