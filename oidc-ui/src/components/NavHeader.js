import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import openIDConnectService from "../services/openIDConnectService";
import authService from "../services/authService";
import { Buffer } from "buffer";

export default function NavHeader({ langOptions, i18nKeyPrefix = "header" }) {
  const { i18n } = useTranslation("translation", {
    keyPrefix: i18nKeyPrefix,
  });
  const authServices = new authService(openIDConnectService);
  const authorizeQueryParam = "authorize_query_param";
  const ui_locales = "ui_locales";

  // Decode the authorize query param
  const decodedBase64 = Buffer.from(
    authServices.getAuthorizeQueryParam(),
    "base64"
  ).toString();

  var urlSearchParams = new URLSearchParams(decodedBase64);

  useEffect(() => {
    //Gets fired when changeLanguage got called.
    i18n.on("languageChanged", function (lng) {
      let language = langOptions.find((option) => {
        return option.value === lng;
      });

      // Setting up the current i18n language in the URL on every language change.

      // Convert the decoded string to JSON
      var jsonObject = {};
      urlSearchParams.forEach(function (value, key) {
        jsonObject[key] = value;

        // Assign the current i18n language to the ui_locales
        if (key === ui_locales && language) {
          jsonObject[key] = language.value;
        }
      });

      // Convert the JSON back to decoded string
      Object.entries(jsonObject).forEach(([key, value]) => {
        urlSearchParams.set(key, value);
      });

      // Encode the string
      var encodedString = urlSearchParams.toString();

      const encodedBase64 = Buffer.from(encodedString).toString("base64");

      // Remove the old authorizeQueryParam from the local storage
      localStorage.removeItem(authorizeQueryParam);

      // Insert the new authorizeQueryParam to the local storage
      localStorage.setItem(authorizeQueryParam, encodedBase64);
    });
  }, [langOptions]);

  return (
    <nav
      className="bg-white border-gray-500 md:px-[4rem] py-2 px-[0.5rem] navbar-header"
      id="navbar-header"
    >
      <div className="flex h-full items-center justify-between">
        <div className="ltr:sm:ml-8 rtl:sm:mr-8 ltr:ml-1 rtl:mr-1">
          <img className="brand-logo" alt="brand_logo" />
        </div>
      </div>
    </nav>
  );
}
