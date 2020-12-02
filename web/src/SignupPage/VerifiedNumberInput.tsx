import {Alert, Button, InputGroup, InputGroupText, TextInput} from "@patternfly/react-core";
import React from "react";
import {useTranslation} from "../Utils/i18n";
import firebase from "firebase";
import * as Sentry from "@sentry/browser";

interface IVerifiedNumberInput {
  data: string,
  isValid: boolean,
  onChange: (phoneNumber: string) => void,
  loginForm?: boolean,
}

enum State {
  UNKNOWN,
  START,
  SMS_SENT,
  VERIFIED,
}

export const VerifiedNumberInput: React.FC<IVerifiedNumberInput> = ({onChange, data, isValid, loginForm}) => {
  const t = useTranslation();
  const [value, setValue] = React.useState(data);
  const [code, setCode] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [state, setState] = React.useState<State>(State.START);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [verifierMessage, setVerifierMessage] = React.useState("");

  const recaptchaInstance = React.useRef<firebase.auth.RecaptchaVerifier_Instance | null>(null);
  const confirmationResult = React.useRef<firebase.auth.ConfirmationResult | null>(null);

  const handleError = (e: any) => {
    console.error(e);
    setErrorMessage(Sentry.captureException(e));
  };

  React.useEffect(() => {
    recaptchaInstance.current = new firebase.auth.RecaptchaVerifier('recaptchaContainer',
      {
        'size': 'invisible',
        'callback': function (response: any) {
          console.log("reCaptcha:", response);
        },
        'expired-callback': function () {
          console.log("reCaptcha expired");
        }
      });
  }, []);

  React.useEffect(() => {
    return firebase.auth().onAuthStateChanged(() => {
      const user = firebase.auth().currentUser;

      if (user !== null) {
        Sentry.configureScope((scope) => {
          scope.setUser({
            "id": user.uid,
            "email": user.email ? user.email : "",
          });
        });

        if (user.phoneNumber !== null) {
          setState(State.VERIFIED);
        }

        if (user.email) {
          setEmail(user.email)
        }
      } else {
        Sentry.configureScope((scope) => {
          scope.setUser({
            "id": "",
            "email": "",
          });
        });

        if (confirmationResult.current !== null) {
          setState(State.SMS_SENT)
        } else {
          setState(State.START);
        }
      }
    });
  });

  return (
    <>
      <InputGroup>
        <TextInput
          type="text"
          value={value}
          placeholder={(loginForm && state !== State.START) ? email : "+49 1520 12345678"}
          onChange={(e) => setValue(e)}
          isValid={isValid}
          isDisabled={state !== State.START || loading}
        />
        {state === State.START ?
          <>
            <Button
              id="calcButton"
              variant="secondary"
              isDisabled={loading}
              onClick={(e) => {
                setLoading(true);

                if (recaptchaInstance.current === null) {
                  handleError("recaptchaInstance is null")
                  return
                }

                firebase.auth().signInWithPhoneNumber(value, recaptchaInstance.current)
                  .then(function (result) {
                    console.log("Confirmation request successful", result);
                    setLoading(false);
                    setErrorMessage("");
                    confirmationResult.current = result;
                    setState(State.SMS_SENT);
                  }).catch(function (error) {
                  if (error.code === "auth/invalid-phone-number") {
                    setVerifierMessage(t({
                      de: "Die eingebene Telefonnummer ist ungültig.",
                      en: 'The phone number you entered is invalid.',
                    }));
                  } else {
                    handleError(error);
                  }
                  setLoading(false);
                });
              }}>{t({
              de: 'Nummer bestätigen',
              en: 'Verify number',
            })}</Button>
          </> : null}
        {state === State.SMS_SENT ?
          <>
            <TextInput
              type="text"
              value={code}
              placeholder={"Bestätigungscode"}
              onChange={(e) => setCode(e)}
            />
            <Button
              id="calcButton"
              variant="secondary"
              isDisabled={loading}
              onClick={(e) => {
                if (confirmationResult.current !== null) {
                  if (confirmationResult.current) {
                    setLoading(true);
                    (confirmationResult.current as firebase.auth.ConfirmationResult).confirm(
                      code).then(function (user) {
                      console.log("Number successfully verified:", user);
                      confirmationResult.current = null;
                      setVerifierMessage("");
                      setErrorMessage("");
                      setLoading(false);
                      const cleanPhoneNumber = user.user && user.user.phoneNumber ? user.user.phoneNumber : "";
                      onChange(cleanPhoneNumber);
                      setValue(cleanPhoneNumber);
                    }).catch(function (error) {
                      if (error.code === "auth/invalid-verification-code") {
                        setVerifierMessage(t({
                          de: "Der Bestätigungscode ist ungültig.",
                          en: 'The confirmation code you entered is invalid.',
                        }));
                      } else {
                        handleError(error);
                      }
                      setLoading(false);
                    });
                  }
                }
              }}>{t({
              de: 'Code bestätigen',
              en: 'Verify code',
            })}</Button>
          </> : null}
        {state === State.VERIFIED ?
          <>
            <InputGroupText>
              <i className="pf-icon pf-icon-ok" style={{color: "darkgreen"}}/>
              &nbsp;
              {t({
                de: <>Verifiziert</>,
                en: <>Verified</>,
              })}
            </InputGroupText>
            <Button
              id="calcButton"
              variant="control"
              isDisabled={loading}
              onClick={(e) => {
                setLoading(true);
                firebase.auth().signOut().then(() => {
                  setLoading(false);
                  setErrorMessage("");
                  onChange("");
                }).catch(reason => {
                  setLoading(false);
                  handleError(reason);
                })
              }}>
              {loginForm ? t({de: "Abmelden", en: "Log out"}) : t({de: 'Löschen', en: 'Delete'})}
            </Button>
          </> : null}
      </InputGroup>
      {errorMessage !== "" ?
        // TODO: dedup
        <Alert
          variant="danger"
          isInline
          title={t({
            de: "Ein Fehler ist aufgetreten. Bitte versuche es erneut, oder kontaktiere rdp@leoluk.de mit der folgenden Fehlernummer, falls der Fehler weiterhin auftritt:",
            en: "An error occurred. Please retry and contact rdp@leoluk.de with the following error ID, if the error persists:",
          })}>{errorMessage}</Alert> : null}
      {verifierMessage !== "" ? <Alert
        variant="danger"
        isInline
        title={verifierMessage}/> : null}
      <div id="recaptchaContainer" style={{marginTop: "5px"}}/>
    </>
  );
};

