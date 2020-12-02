import React, {useEffect} from "react";
import {
  ActionGroup,
  Alert,
  Bullseye,
  Button,
  Checkbox,
  Form,
  FormGroup,
  FormSelect,
  FormSelectOption,
  PageSection,
  PageSectionVariants,
  Text,
  TextArea,
  TextContent,
  TextInput,
  TextVariants
} from "@patternfly/react-core";

import * as Sentry from '@sentry/browser';
import axios from 'axios';
import {useTranslation} from "../Utils/i18n";
import {PriceAdjustmentForm} from "./PriceAdjustmentForm";
import {invalidTextT, placementGroups} from "./Common";
import {GroupCopyLinks} from "./ManageGroupPage";
import AuthComponent from "../Auth/AuthComponent"

axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";

export interface IGroupSignup {
  agbAgreedContact: boolean;
  existingIntlGroup: string;
  contactName: string;
  thirdPlacementChoice: string;
  secondPlacementChoice: string;
  priceAdjustments: { [s: string]: number };
  isIntlGroup: boolean;
  wantIntlGroup: boolean;
  agbAgreedOrg: boolean;
  allowEarlyDeparture: boolean,
  communalEarlyDeparture: boolean,
  requireEarlyDeparture: boolean,
  publicTransport: string,
  name: string;
  mixedOrg: boolean;
  contactAddress: string;
  firstPlacementChoice: string;
  billingAddress: string;
  contactMail: string;
  contactPhone: string;
  extraText: string;
  parentOrg: string;
  parentOrgOther: string;
  coockingGroup: string;
}

export const parentOrgsStatic = [
  'DPSG Rottenburg-Stuttgart',
  'PSG Rottenburg-Stuttgart',
  'DPSG Freiburg',
  'PSG Freiburg',
  'VCP Baden',
  'VCP Württemberg',
  'BdP Baden-Württemberg',
  'International guest',
];

export const driversLicenses = [
  '---',
  'B1',
  'B',
  'BE',
  'C',
  'D'
]

const GroupSignupPage: React.FC = () => {
  const t = useTranslation();

  const parentOrgOther = t({
    de: 'Sonstige (bitte angeben)',
    en: 'Other (please specify)',
  });

  const familyPlacementGroup = 'Ehemaligen- und Familienunterlager';

  const parentOrgs = [...parentOrgsStatic, parentOrgOther];

  const defaultValues = {
    name: '',
    parentOrg: '',
    parentOrgOther: '',
    mixedOrg: false,
    billingAddress: '',
    contactName: '',
    contactAddress: '',
    contactMail: '',
    contactPhone: '',
    agbAgreedOrg: false,
    agbAgreedContact: false,
    wantIntlGroup: false,
    isIntlGroup: false,
    allowEarlyDeparture: false,
    communalEarlyDeparture: false,
    requireEarlyDeparture: false,
    publicTransport: '',
    existingIntlGroup: '',
    firstPlacementChoice: '',
    secondPlacementChoice: '',
    thirdPlacementChoice: '',
    extraText: '',
    priceAdjustments: {},
    coockingGroup: '',
  };

  const requiredKeys: (keyof IGroupSignup)[] = [
    "name",
    "parentOrg",
    "billingAddress",
    "contactName",
    "contactAddress",
    "contactMail",
    "contactPhone",
    "agbAgreedOrg",
    "agbAgreedContact",
    "firstPlacementChoice",
    "publicTransport",
  ];

  const clearValues = () => {
    setValues(defaultValues);
    setValidationEnabled(false);
    // firebase.auth().signOut().catch(reason => {
    //   console.log(reason);
    //   setErrorMessage(Sentry.captureException(reason));
    // })
  };

  const [errorMessage, setErrorMessage] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [loggedIn, setLoggedIn] = React.useState(false);

  function handleLoggedInChange(value: boolean) {
    setLoggedIn(value);
  }
  
  const apiEndpoint: String = process.env.NODE_ENV === "development" ? 'http://localhost:8000/api/v1' : 'https://backend.anmeldung-test.farbenmeehr2020.de/api/v1';

  const submit = async () => {
    validateAll();

    if (isAnyInvalid()) {
      return
    }

    setLoading(true);

    if(!loggedIn){
      throw new Error("not logged In");
    }
      axios.post(apiEndpoint + '/groups/', {...values,},{
        headers: { 'Authorization': `Bearer ${JSON.parse(window.localStorage.token)}` },
        withCredentials: true
        })
      .then((res) => {
        setErrorMessage("");
        setSuccess(res.data.id);

        if (process.env.NODE_ENV !== "development") {
          clearValues();
        }

        setLoading(false);
      })
      .catch(function (e) {
        setLoading(false);
        console.error(e);
        setErrorMessage(Sentry.captureException(e));
      });
    
    /*
    try {
      const user = firebase.auth().currentUser;

      if (!user) {
        throw new Error("user is null");
      }

      Sentry.configureScope((scope) => {
        scope.setUser({
          "id": user.uid,
          "email": user.email ? user.email : "",
        });
      });

      await user.updateEmail(values.contactMail);
      // TODO: send to group management page
      // https://firebase.google.com/docs/auth/web/passing-state-in-email-actions
      await user.sendEmailVerification();

      await user.updateProfile({displayName: values.contactName});

      const result = await db.collection("groups").add({
        values: values,
        meta: {
          createdBy: user.uid,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        }
      });

      setErrorMessage("");
      setSuccess(result.id);

      if (process.env.NODE_ENV !== "development") {
        clearValues();
      }

      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.error(e);
      setErrorMessage(Sentry.captureException(e));
    }
    */
  };
  const [values, setValues] = React.useState<IGroupSignup>(() => {
    const storedData = localStorage.getItem('groupSignupState');

    if (storedData == null) {
      return defaultValues;
    } else {
      try {
        return JSON.parse(storedData);
      } catch (e) {
        console.log(e);
        return defaultValues;
      }
    }
  });

  const [valid, setValid] = React.useState<Map<keyof IGroupSignup, boolean>>(
    new Map<keyof IGroupSignup, boolean>());

  const [validationEnabled, setValidationEnabled] = React.useState(false);

  const validateField: (field: keyof IGroupSignup) => boolean = (field) => {
    const value = values[field];

    switch (typeof value) {
      // string fields are considered valid if not empty
      case "string":
        if ((value as string).trim() === "") {
          return true;
        }
        break;
      // boolean fields are considered valid if checked
      case "boolean":
        return !(value as boolean);
      // objects are ignored
      case "object":
        break;
      default:
        console.error("Unknown value encountered while validating", value);
    }

    return false;
  };

  const validateAll = () => {
    setValidationEnabled(true);

    const validationResults = new Map<keyof IGroupSignup, boolean>();

    requiredKeys.forEach(key => {
      validationResults.set(key, validateField(key));
    });

    setValid(validationResults);
  };

  const isAnyInvalid: () => boolean = () => {
    let invalid = false;

    requiredKeys.forEach(key => {
      const result = validateField(key);
      if (result) {
        invalid = true;
      }
    });

    return invalid;
  };

  const fieldBlurValidate = () => {
    if (validationEnabled) {
      validateAll();
    }
  };

  const invalidText = t(invalidTextT);

  useEffect(() => {
    localStorage.setItem('groupSignupState', JSON.stringify(values));

    // add some context to Sentry such that we can identify users who encountered exceptions
    Sentry.configureScope(function (scope) {
      scope.setExtras({
        signupValues: {
          ...values,
          // sanitize fields for privacy reasons
          billingAddress: "<snip>",
          contactAddress: "<snip>",
          contactPhone: "<snip>",
        }
      });
    });
  }, [values]);

  const termsOfServiceLink = (t({
    de: <a href="https://farbenmeehr2020.de/de/agb" target="_blank" rel="noopener noreferrer">AGB</a>,
    en: <a href="https://farbenmeehr2020.de/en/agb" target="_blank" rel="noopener noreferrer">terms</a>,
  }));

  const pricingLink = (t({
    de: <a href="https://farbenmeehr2020.de/de/kosten" target="_blank" rel="noopener noreferrer">Webseite</a>,
    en: <a href="https://farbenmeehr2020.de/en/kosten" target="_blank" rel="noopener noreferrer">main
      page</a>,
  }));

  const selectPlaceholder = (
    <FormSelectOption key="placeholder" value="" label={t({
      de: "Bitte auswählen",
      en: 'Please choose',
    })} isDisabled/>
  );

  return (
    <>
      {/*<PageSection variant={PageSectionVariants.light}>*/}
      {/*  <Alert variant="info" isInline title={t({*/}
      {/*    de: "Die Anmeldung wurde noch nicht freigegeben. Versucht es später noch einmal.",*/}
      {/*    en: "The registration has not yet started.",*/}
      {/*  })}/>*/}
      {/*</PageSection>*/}
      {!success ? <><PageSection variant={PageSectionVariants.light}>
        <TextContent>
          <Bullseye>
            <Text component={TextVariants.h1}>
              {t({
                de: <>Stammesanmeldung</>,
                en: <>Group registration</>,
              })}
            </Text>
          </Bullseye>
          {t({
            de:
              <>
                <Text>
                  Mit diesem Formular meldet Ihr Euren Stamm verbindlich zum rdp-Ringelager
                  "FarbenmEEHr 2020 - Vielfalt erleben" vom 02.08. bis 12.08.2021 an.
                </Text>
                <Text>
                  Nach dem Abschicken des Formulars erhaltet ihr eine Mail mit einem Bestätigungslink,
                  mit dem ihr die Anmeldung bestätigen müsst.
                </Text>
                <Text>
                  Bei Rückfragen könnt ihr <a
                  href="mailto:fragen@farbenmeehr2020.de">fragen@farbenmeehr2020.de</a> kontaktieren.
                </Text>
                <Text>
                  Mehr Informationen zum Lager findet ihr auf der <a
                  href="https://farbenmeehr2020.de/" rel="noopener noreferrer"
                  target="_blank">Hauptseite</a>{' '}
                  und in den <a href="https://farbenmeehr2020.de/agb" target="_blank"
                                rel="noopener noreferrer">AGB</a>.
                </Text>
                <Text>
                  Alle Felder mit <span className="pf-c-form__label-required">*</span> müssen ausgefüllt
                  werden.
                </Text>
                <Text>
                  Familien registrieren sich als eigener Stamm, gerne im Familien-Unterlager, 
                  und erhalten dann eine separate Rechnung. 
                  Jedes Familienmitglied meldet sich dann über den Familien-Stamm separat als Teilnehmer*in an.
                </Text>
                <Text>
                  Helfende melden sich separat an.
                  Ehemalige melden sich entweder als Teil eines Stamms oder im Helfenden-Stamm an.
                </Text>
                <Text>
                  Teilnahme am Kick-off-Lager ist verpflichtend 
                  (da dort wichtige Infos für den Ablauf des Lagers mitgeteilt 
                  werden und eure Teilnahme für die Erreichung der Ziele des Ringelagers wichtig ist).
                  Es findet statt am 11.-13.06.2021
                </Text>
              </>,
            en:
              <>
                <Text>
                  Using this form, you can register your group for the rdp Ringelager
                  "FarbenmEEHr 2020 - Vielfalt erleben".
                </Text>
                <Text>
                  After submitting the form you will receive a mail with a confirmation link,
                  which you have to use to confirm your registration.
                </Text>
                <Text>
                  After verifying your registration, you will receive an email with registration links for
                  your
                  participants and group leaders. For leaders, personal logins can be created,
                  which can be used to view and manage your group's registrations.
                </Text>
                <Text>
                  Contact <a
                  href="mailto:fragen@farbenmeehr2020.de">fragen@farbenmeehr2020.de</a> for questions.
                </Text>
                <Text>
                  More information can be found <a
                  href="https://farbenmeehr2020.de/" rel="noopener noreferrer" target="_blank">on the main
                  page</a>{' '}
                  and the {termsOfServiceLink}.
                </Text>
                <Text>
                  All fields marked with <span className="pf-c-form__label-required">*</span> are required.
                </Text>
              </>
          })}
        </TextContent>
      </PageSection>
        <PageSection variant={PageSectionVariants.light}>
          <TextContent>
            <Form>
              <FormGroup
                label={t({
                  de: "Name des Stammes",
                  en: "Group name",
                })}
                fieldId="name"
                helperTextInvalid={invalidText}
                isValid={!valid.get("name")}
                isRequired>
                <TextInput
                  isRequired
                  type="text"
                  value={values.name}
                  isValid={!valid.get("name")}
                  onChange={(e) => setValues({...values, name: e})}
                  onBlur={fieldBlurValidate}
                />
              </FormGroup>
              <FormGroup
                label={t({
                  de: "Verbandszugehörigkeit",
                  en: "Parent organization",
                })}
                fieldId="parentOrg"
                helperTextInvalid={invalidText}
                isValid={!valid.get("parentOrg")}
                isRequired
              >
                <FormSelect
                  isDisabled={values.parentOrgOther !== ""}
                  value={values.parentOrg}
                  onChange={(e) => setValues({...values, parentOrg: e})}
                  isValid={!valid.get("parentOrg")}
                  onBlur={fieldBlurValidate}
                >
                  {selectPlaceholder}
                  {parentOrgs.map((org, index) => (
                    <FormSelectOption key={index} value={org} label={org}/>
                  ))}
                </FormSelect>
                {values.parentOrg === parentOrgOther ?
                  <TextInput
                    isRequired
                    type="text"
                    value={values.parentOrgOther}
                    onChange={(e) => setValues({...values, parentOrgOther: e})}
                  />
                  : null}
              </FormGroup>
              <FormGroup
                fieldId="mixedOrg"
                helperText={t({
                  de: "Falls dieser Haken gesetzt ist, müssen Teilnehmende bei der Anmeldung ihre eigene Verbandszugehörigkeit bestätigen.",
                  en: "This means that participants will have to select their individual parent organization.",
                })}
              >
                <Checkbox
                  label={t({
                    de: "Unser Stamm hat Mitglieder aus anderen Verbänden.",
                    en: "Our group has members from different parent organizations.",
                  })}
                  id="isIntlGroup"
                  isChecked={values.mixedOrg}
                  onChange={(e) => setValues({...values, mixedOrg: e})}
                />
              </FormGroup>
              <FormGroup
                label={t({
                  de: "Vollständige Rechnungsanschrift des Stammes",
                  en: "Billing address",
                })}
                fieldId="billingAddress"
                helperText={t({
                  de: "Bei Stämmen, die eine Rechtsperson (wie ein e.V.) sind, muss hier die Rechnungsanschrift der Rechtsperson angegeben werden, ansonsten eine Privatanschrift. Die Adresse wird für den Rechnungsversand genutzt.",
                  en: "Will be used for invoicing your group.",
                })}
                helperTextInvalid={invalidText}
                isValid={!valid.get("billingAddress")}
                isRequired
              >
                <TextArea
                  rows={6}
                  value={values.billingAddress}
                  onChange={(e) => setValues({...values, billingAddress: e})}
                  isValid={!valid.get("billingAddress")}
                  onBlur={fieldBlurValidate}
                />
              </FormGroup>
              <FormGroup
                label={t({
                  de: "Name der verantwortlichen Person",
                  en: "Primary contact",
                })}
                fieldId="contactName"
                helperTextInvalid={invalidText}
                isValid={!valid.get("contactName")}
                isRequired
                helperText={t({
                  de: "Verantwortliche Person für die Anmeldung und den Kontakt zum Stamm. Es können später unabhängig hiervon mehrere Leiter*innenzugänge angelegt werden.",
                  en: "Main point of contact for the group who is responsible for this registration.",
                })}
              >
                <TextInput
                  type="text"
                  value={values.contactName}
                  isValid={!valid.get("contactName")}
                  onBlur={fieldBlurValidate}
                  onChange={(e) => setValues({...values, contactName: e})}
                />
              </FormGroup>
              <FormGroup
                label={t({
                  de: "Anschrift der verantwortlichen Person",
                  en: "Primary contact's address",
                })}
                fieldId="contactAddress"
                helperTextInvalid={invalidText}
                isValid={!valid.get("contactAddress")}
                isRequired
              >
                <TextArea
                  rows={6}
                  value={values.contactAddress}
                  onChange={(e) => setValues({...values, contactAddress: e})}
                  isValid={!valid.get("contactAddress")}
                  onBlur={fieldBlurValidate}
                />
              </FormGroup>
              <FormGroup
                label={t({
                  de: "Handynummer der verantwortlichen Person",
                  en: "Primary contact mobile phone number",
                })}
                fieldId="contactPhone"
                helperText={t({
                  de: "Mit dieser Handynummer können wir Dich im Notfall erreichen.",
                  en: "This phone number will be used to contact you in case of an emergency.",
                })}
                helperTextInvalid={invalidText}
                isValid={!valid.get("contactMail")}
                isRequired
              >
                <TextInput 
                  type="tel"
                  value={values.contactPhone}
                  isValid={!valid.get("contactPhone")}
                  onBlur={fieldBlurValidate}
                  onChange={(e) => setValues({...values, contactPhone: e})}
                />
              </FormGroup>
              <FormGroup
                label={t({
                  de: "E-Mail-Adresse",
                  en: "Email address",
                })}
                fieldId="contactMail"
                helperText={t({
                  de: "An diese E-Mail-Adresse werden die Links für die Anmeldung der Teilnehmenden und der Stammesleitung geschickt und sie wird für die weitere Kommunikation genutzt.",
                  en: "Will be used to send registration links and other important communication.",
                })}
                helperTextInvalid={invalidText}
                isValid={!valid.get("contactMail")}
                isRequired
              >
                <TextInput
                  type="text"
                  value={values.contactMail}
                  onChange={(e) => setValues({...values, contactMail: e})}
                  isValid={!valid.get("contactMail")}
                  onBlur={fieldBlurValidate}
                />
              </FormGroup>
              <FormGroup
                label={t({
                  de: "Wunsch-Unterlager (1. Wahl)",
                  en: "Sub-camp preference (1st choice)",
                })}
                fieldId="firstPlacementChoice"
                helperTextInvalid={invalidText}
                isValid={!valid.get("firstPlacementChoice")}
                isRequired
              >
                <FormSelect
                  value={values.firstPlacementChoice}
                  onBlur={fieldBlurValidate}
                  isValid={!valid.get("firstPlacementChoice")}
                  onChange={(e) => {
                    if (e === familyPlacementGroup) {
                      setValues({
                        ...values,
                        firstPlacementChoice: e,
                        allowEarlyDeparture: true,
                        communalEarlyDeparture: false,
                        requireEarlyDeparture: false
                      })
                    } else {
                      setValues({...values, firstPlacementChoice: e})
                    }
                  }}
                >
                  {selectPlaceholder}
                  {[...placementGroups, familyPlacementGroup].map((org, index) => (
                    <FormSelectOption key={index} value={org} label={org}/>
                  ))}
                </FormSelect>
              </FormGroup>
              {/* TODO: field validation for dependent fields that can disappear */}
              <FormGroup
                label={t({
                  de: "Wunsch-Unterlager (2. Wahl)",
                  en: "Sub-camp preference (2nd choice)",
                })}
                fieldId="secondPlacementChoice"
                isRequired
              >
                <FormSelect
                  isDisabled={values.firstPlacementChoice === familyPlacementGroup}
                  value={values.secondPlacementChoice}
                  onChange={(e) => setValues({...values, secondPlacementChoice: e})}
                >
                  {selectPlaceholder}
                  {placementGroups.map((org, index) => (
                    <FormSelectOption key={index} value={org} label={org}/>
                  ))}
                </FormSelect>
              </FormGroup>
              <FormGroup
                label={t({
                  de: "Wunsch-Unterlager (3. Wahl)",
                  en: "Sub-camp preference (3rd choice)",
                })}
                fieldId="thirdPlacementChoice"
                isRequired
              >
                <FormSelect
                  isDisabled={values.firstPlacementChoice === familyPlacementGroup}
                  value={values.thirdPlacementChoice}
                  onChange={(e) => setValues({...values, thirdPlacementChoice: e})}
                >
                  {selectPlaceholder}
                  {placementGroups.map((org, index) => (
                    <FormSelectOption key={index} value={org} label={org}/>
                  ))}
                </FormSelect>
              </FormGroup>
              <FormGroup
                label={t({
                  de: "Informationen für die Teilnehmenden",
                  en: "Extra information to be displayed during registration",
                })}
                fieldId="extraText"
                helperText={t({
                  de: "Ihr könnt hier optional einen Text hinterlegen, der Euren Teilnehmenden bei der Registrierung angezeigt wird, etwa für weitere Hinweise zum Ablauf und der Bezahlung.",
                  en: "This text will be shown to participants when they register, like for extra instructions on payment and the registration procedure.",
                })}
              >
                <TextArea
                  rows={6}
                  value={values.extraText}
                  onChange={(e) => setValues({...values, extraText: e})}
                />
              </FormGroup>
              {(values.firstPlacementChoice !== familyPlacementGroup) ?
                <>
                  <FormGroup
                    fieldId="allowEarlyDeparture"
                    label={t({
                      de: "Frühere Abreise",
                      en: "Early departure",
                    })}
                    helperText={t({
                      de: "Mit diesem Haken gebt ihr die Option für eine frühere Abreise der Teilnehmenden Eurer Stämme frei. Diese ist in erster Linie für Wichtel und Wölflinge gedacht. Ist der Haken nicht gesetzt, können sich Teilnehmende nur für den gesamten Lagerzeitraum vom 02.08.2021 – 12.08.2021 anmelden.",
                      en: "This option enables an earlier departure for your participants. This is primarily meant for cubs. If the check mark is not set, participants can only register for the entire duration (02.-12.08.2021).",
                    })}
                  >
                    <Checkbox
                      id="allowEarlyDeparture"
                      label={
                        <>
                          {t({
                            de: <>Freigabe einer früheren Abreise am 08.08.2021</>,
                            en: <>Possibility of an earlier departure on 08.08.2021</>,
                          })}
                        </>
                      }
                      isChecked={values.allowEarlyDeparture}
                      onChange={(e) => {
                        if (!e) {
                          setValues({
                            ...values,
                            allowEarlyDeparture: false,
                            communalEarlyDeparture: false,
                            requireEarlyDeparture: false,
                          })
                        } else {
                          setValues({...values, allowEarlyDeparture: true});
                        }
                      }}
                    />
                  </FormGroup>
                  <FormGroup
                    fieldId="communalEarlyDeparture"
                    label={t({
                      de: "Organisation der früheren Abreise",
                      en: "Organizing the early departure",
                    })}
                    helperText={t({
                      de: "Bitte bei der Anpassung der Preise beachten. Falls der Stamm keine frühe Abreise organisiert, muss diese individuell von den Erziehungsberechtigten organisiert werden.",
                      en: "Keep this in mind when modifying the prices. If there's no early departure organized by the group, parents will have to make individual arrangements.",
                    })}
                  >
                    <Checkbox
                      id="communalEarlyDeparture"
                      label={
                        <>
                          {t({
                            de: <>Der Stamm organisiert die frühere Abreise.</>,
                            en: <>Our group organizes the early departure.</>,
                          })}
                        </>
                      }
                      isChecked={values.communalEarlyDeparture}
                      onChange={(e) => setValues({...values, communalEarlyDeparture: e})}
                      isDisabled={!values.allowEarlyDeparture}
                    />
                  </FormGroup>
                  <FormGroup
                    fieldId="requireEarlyDeparture"
                    label={t({
                      de: "Verpflichtende frühere Abreise für Wichtel/Wölflinge",
                      en: "Required early departure for all cubs",
                    })}
                    helperText={t({
                      de: "Wichtel/Wölflinge haben nur die Option, früh abzureisen.",
                      en: "Cubs must choose early departure.",
                    })}
                  >
                    <Checkbox
                      id="requireEarlyDeparture"
                      label={
                        <>
                          {t({
                            de: <>Alle Wichtel/Wölflinge reisen gemeinsam früher ab.</>,
                            en: <>All cubs have to choose early departure.</>,
                          })}
                        </>
                      }
                      isChecked={values.requireEarlyDeparture}
                      onChange={(e) => setValues({...values, requireEarlyDeparture: e})}
                      isDisabled={!values.allowEarlyDeparture}
                    />
                  </FormGroup>
                </> : null}
              <FormGroup
                label={t({
                  de: "Kochgruppe (für kleine Gruppen)",
                  en: "Coocking-Group (for small groups)",
                })}
                fieldId="coockingGroup"
                helperTextInvalid={invalidText}
                isValid={!valid.get("coockingGroup")}
                helperText={t({
                  de: "Name des Stammes",
                  en: "Name of the group",
                })}
              >
                <Text>
                {t({
                  de: <>Ich möchte mit dem unten genannten Stamm eine Kochgruppe bilden. Deswegen haben wir auch den selben Unterlagerwunsch angegeben. Das Ringelagerteam wird dies berücksichtigen.</>,
                  en: <>I would like to form a Coocking-Group with the following group. For that reason we want to be in the same sub-camp. The campteam will regard your whish.</>,
                })}
                </Text>
                <TextInput
                  type="text"
                  value={values.coockingGroup}
                  onChange={(e) => setValues({...values, coockingGroup: e})}
                  isValid={!valid.get("coockingGroup")}
                  onBlur={fieldBlurValidate}
                />
              </FormGroup>
              <FormGroup
                label={t({
                  de: "Anreise mit öffentlichen Verkehrsmitteln",
                  en: "Public Transportation",
                })}
                fieldId="publicTransport"
                helperTextInvalid={invalidText}
                isValid={!valid.get("publicTransport")}
                helperText={t({
                  de: "Wir müssen die öffentlichen Verkehrsbetriebe rechtzeitig über die zu erwartenden Passagierzahlen informieren, damit diese genug Kapazitäten bereitstellen können. Falls euer Stamm plant, mit den öffentlichen Verkehrsmitteln per Bus oder Bahn anzureisen, gebt dies bitte hier an. Wenn ihr die Anreise anderweitig organisiert, etwa mit einem eigenen Bus, wählt bitte \"Keine Anreise mit ÖPNV\".",
                  en: "We need to inform the public transport companies about expected passenger counts, such that they can deploy extra capacity. If your group plans to use public buses or trains to travel to the site, please specify it here. If you organize transportation yourself - like chartering your own bus - please specify \"We do not use public transport\".",
                })}
                isRequired
              >
                <FormSelect
                  value={values.publicTransport}
                  onChange={(e) => setValues({...values, publicTransport: e})}
                  isValid={!valid.get("publicTransport")}
                  onBlur={fieldBlurValidate}
                >
                  {selectPlaceholder}
                  <FormSelectOption key={0} value="train" label={t({
                    de: "Bahn",
                    en: "Public Rail",
                  })}/>
                  <FormSelectOption key={1} value="bus" label={t({
                    de: "Bus",
                    en: "Public Bus",
                  })}/>
                  <FormSelectOption key={2} value="other" label={t({
                    de: "Keine Anreise mit ÖPNV",
                    en: "We do not use public transport",
                  })}/>
                </FormSelect>
              </FormGroup>
              <Text component={TextVariants.h2}>
                {t({
                  de: <>Individuelle Preise</>,
                  en: <>Price customization</>,
                })}
              </Text>
              <Text>
                {t({
                  de:
                    <>
                      Damit die Teilnehmenden bei der Anmeldung den für sie gültigen Preis sehen können, könnt
                      ihr hier die Preise für die Teilnehmenden individuell anpassen. Bitte berücksichtigt
                      dabei
                      zusätzliche
                      Kosten wie z.B. die Anreise und preissenkende Faktoren wie bspw. Spenden.
                      <br/><br/>
                      Bitte beachtet, dass wir Euch für jeden Teilnehmenden immer den von uns angegebenen
                      Listenpreis in Rechnung stellen,
                      unabhängig davon, wie ihr die Preise für Eure Teilnehmenden anpasst.
                      <br/><br/>
                      Die Preise können während der Anmeldephase nicht mehr geändert werden.
                      <br/><br/>
                      Mehr Informationen findet ihr auf der {pricingLink} und den {termsOfServiceLink}.
                    </>,
                  en:
                    <>
                      The list prices displayed to the participants for the event can be individually adjusted
                      here.
                      Groups can define their own premium for each contribution class to account for travel
                      and other expenses. If you wish to handle those separately from the registration, just
                      leave
                      the default values.
                      <br/><br/>
                      Please note that your group will always be billed our list price,
                      independently of the prices you set.
                      <br/><br/>
                      Prices cannot be changed once participants have started registering.
                      <br/><br/>
                      More information on pricing can be found on the {pricingLink} and
                      the {termsOfServiceLink}.
                    </>,
                })}
              </Text>
              <PriceAdjustmentForm
                data={values.priceAdjustments}
                onChange={data => {
                  setValues({...values, priceAdjustments: data})
                }}
              />
              <Text component={TextVariants.h2}>
                {t({
                  de: <>Internationale Gastgruppen</>,
                  en: <>International Guests</>,
                })}
              </Text>
              <FormGroup
                fieldId="wantIntlGroup"
                label={t({
                  de: "Internationale Gastgruppen",
                  en: "International Guests",
                })}
                helperText={
                  <>
                    {t({
                      de:
                        <>
                          Setzt hier einen Haken, falls Ihr eine internationale
                          Gastgruppe aufnehmen möchte. Falls ihr bereits eine Partnergruppe habt,
                          stattdessen unten den Namen der Gruppe angeben.
                        </>,
                      en:
                        <>
                          Check this box if you're a German group which wants to host an international guest.
                        </>,
                    })}{' '}<br/>
                    <a href="https://farbenmeehr2020.de/international/" target="_blank"
                       rel="noopener noreferrer">
                      {t({
                        de: <>Mehr Informationen auf der Homepage</>,
                        en: <>More information on the main page</>,
                      })}</a>.
                  </>
                }>
                <Checkbox
                  label={t({
                    de: "Wir möchten eine internationale Gastgruppe aufnehmen.",
                    en: "We're a German group and want to host an international guest group.",
                  })}
                  id="wantIntlGroup"
                  isChecked={values.wantIntlGroup}
                  onChange={(e) => setValues({...values, wantIntlGroup: e})}
                  isDisabled={values.existingIntlGroup !== "" || values.isIntlGroup}
                />
              </FormGroup>
              <FormGroup
                fieldId="isIntlGroup"
              >
                <Checkbox
                  label={t({
                    de: "Wir sind eine internationale Gruppe und suchen eine deutsche Partnergruppe.",
                    en: "We're an international group and are looking for a German partner.",
                  })}
                  id="isIntlGroup"
                  isChecked={values.isIntlGroup}
                  onChange={(e) => setValues({...values, isIntlGroup: e})}
                  isDisabled={values.existingIntlGroup !== "" || values.wantIntlGroup}
                />
              </FormGroup>
              <FormGroup
                label={t({
                  de: "Name einer vorhandenen Partnergruppe",
                  en: "Existing partnership",
                })}
                fieldId="existingIntlGroup"
                helperText={t({
                  de: "Falls bereits eine Partnerschaft mit einer internationalen Gruppe besteht, die ebenfalls auf das Lager fährt, könnt ihr hier den Namen angeben. Als internationale Gruppe gebt ihr hier den Namen eurer deutschen Partnergruppe an, falls bereits eine Partnerschaft besteht.",
                  en: "If you're a German group which has an existing relationship with an international group which will join the camp, enter their name here. Likewise, if you're an international group with an existing German partner, enter their name here.",
                })}
              >
                <TextInput
                  type="text"
                  value={values.existingIntlGroup}
                  onChange={(e) => setValues({...values, existingIntlGroup: e})}
                  isDisabled={values.isIntlGroup || values.wantIntlGroup}
                />
              </FormGroup>
              <Text component={TextVariants.h2}>
                {t({
                  de: <>Rechtliches</>,
                  en: <>Terms and Conditions</>,
                })}
              </Text>
              <FormGroup
                fieldId="agbAgreedOrg"
                helperTextInvalid={invalidText}
                isValid={!valid.get("agbAgreedOrg")}
                isRequired
                label={t({
                  de: "Zustimmung zur AGB (Stamm)",
                  en: "" +
                    "Terms and Conditions (group)",
                })}
              >
                <Checkbox
                  id="agbAgreedOrg"
                  label={
                    t({
                        de:
                          <>
                            Ich stimme im Namen des Stammes den {termsOfServiceLink} zu (bitte lesen!).
                          </>,
                        en:
                          <>
                            Our group agrees to the {termsOfServiceLink}.
                          </>
                      }
                    )}
                  isChecked={values.agbAgreedOrg}
                  onChange={(e) => {
                    // TODO: trigger revalidation
                    setValues({...values, agbAgreedOrg: e});
                  }}
                />
              </FormGroup>
              <FormGroup
                fieldId="agbAgreedContact"
                label={t({
                  de: "Zustimmung zur AGB (verantwortliche Person)",
                  en: "Terms and Conditions (primary contact)",
                })}
                helperTextInvalid={invalidText}
                isValid={!valid.get("agbAgreedContact")}
                isRequired
              >
                <Checkbox
                  id="agbAgreedContact"
                  label={
                    <>
                      {t({
                        de:
                          <>
                            Ich stimme als verantwortliche Person für meinen Stamm den AGB und der
                            Speicherung und Verarbeitung meiner personenbezogenen Daten
                            zum Zweck der Durchführung der Veranstaltung durch.
                          </>,
                        en:
                          <>
                            As the primary contact, I also agree to the Terms and Conditions and that
                            my personal data will be stored and processed for the sole purpose of organizing
                            the event.
                          </>,
                      })}
                    </>
                  }
                  isChecked={values.agbAgreedContact}
                  onChange={(e) => {
                    setValues({...values, agbAgreedContact: e});
                  }}
                />
              </FormGroup>
              <AuthComponent isLoggedIn={loggedIn} loggedInChange={handleLoggedInChange}/>
            </Form>
          </TextContent>
        </PageSection></> : null}
      {isAnyInvalid() && validationEnabled ?
        <Alert
          variant="danger"
          isInline
          title={t({
            de: "Das Formular ist unvollständig - bitte prüfe Deine Eingaben.",
            en: "Please check your input - validation errors occurred.",
          })}/> : null}
      {errorMessage !== "" ?
        <Alert
          variant="danger"
          isInline
          title={t({
            de: "Ein Fehler ist aufgetreten. Bitte versuche es erneut, oder kontaktiere it@farbenmeehr2020.de mit der folgenden Fehlernummer, falls der Fehler weiterhin auftritt:",
            en: "An error occurred. Please retry and contact it@farbenmeehr2020.de with the following error ID, if the error persists:",
          })}>{errorMessage}</Alert> : null}
      {success !== "" ? <> 
        <Alert
        variant="success" isInline
        title={t({
          de: "Deine Anmeldung wurde erfolgreich abgesendet. Du erhälst nun eine Mail, die Du bestätigen musst. Die Referenznummer deiner Anmeldung lautet:",
          en: "Your registration was successfully submitted. Your reference number is:",
        })}>{success}</Alert>
        <TextContent>
          <Text />
          <GroupCopyLinks groupID={success}/>
          <Text component="h2">
            {t({
              de:
                <>
                  Stamm verwalten
                </>,
              en:
                <>
                  Manage group
                </>,
            })}
          </Text>
          <Text>
            {t({
              de:
                <>
                  Du kannst Deinen Stamm hier verwalten: <a href="/manage/group">Stamm verwalten</a>
                </>,
              en:
                <>
                  You can manage your group here: <a href="/manage/group">Manage Group</a>
                </>,
            })}
          </Text>
        </TextContent>
        </>: null}
      <PageSection variant={PageSectionVariants.light}>
        {!success ? <TextContent>
          <Text>
            {t({
              de:
                <>
                  Eingaben im Formular werden automatisch im Browser gespeichert,
                  bis sie abgeschickt oder gelöscht werden.
                </>,
              en:
                <>
                  Form inputs will be locally stored in your browser until you
                  submit or delete them.
                </>,
            })}
          </Text>
          <Form>
            <ActionGroup>
              <Button variant="primary" onClick={submit} isDisabled={loading || !loggedIn}>{t({
                de: <>Anmeldung abschicken</>,
                en: <>Submit registration</>,
              })}</Button>
              <Button variant="danger" onClick={clearValues}>{t({
                de: <>Formular zurücksetzen</>,
                en: <>Reset form</>,
              })}</Button>
            </ActionGroup>
          </Form>
        </TextContent> : null}
      </PageSection>
    </>
  );
};

export default GroupSignupPage;
