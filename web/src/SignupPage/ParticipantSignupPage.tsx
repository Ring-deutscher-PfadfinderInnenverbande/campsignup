import React from "react";
import {
  ActionGroup,
  Alert,
  Bullseye,
  Button,
  Card,
  CardActions,
  CardBody,
  CardHead,
  CardHeader,
  Form,
  FormSelectOption,
  ListItem,
  PageSection,
  PageSectionVariants,
  Text,
  TextContent,
  TextList,
  TextVariants,
} from "@patternfly/react-core";
import signature from './signature.svg';
import twoSignatures from './two-signatures.svg';
import {useTranslation} from "../Utils/i18n";
import axios from "axios";
import {driversLicenses, parentOrgsStatic} from "./GroupSignupPage";
import {useParams} from "react-router-dom";
import {
  EmergencyContactForm,
  GuardianContactForm,
  IEmergencyContact,
  IGuardianContact,
  IOwnContact,
  OwnContactForm
} from "./ContactForms";
import {FieldArray, Formik} from 'formik';
import {BooleanField, MultiChoiceField, SelectField, TextAreaField, TextField} from "./Fields";
import moment from "moment";
import {Spinner} from "@patternfly/react-core/dist/js/experimental";
import {GetTranslatedPricingClasses} from "./PriceAdjustmentForm";
import {
  dayVisitorMealChoices,
  errorMessages,
  foodOptions,
  genders,
  participantTypeMap,
  placementGroups,
  staffSubtypes,
  staffTypes
} from "./Common";
import AuthComponent from "../Auth/AuthComponent"

axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";

export interface IParticipantSignup {
  group: string,
  fullName: string,
  gender: string,
  parentOrg: string,
  parentOrgOther: string,
  dateOfBirth: string,
  type: keyof typeof participantTypeMap | "",
  rank: string,
  rankLeader: string,
  smallChildRef: string,
  rate: string,
  familyMember: string,

  foodOptions: keyof typeof foodOptions | "",
  maySwim: boolean,

  requiredMedecine: string,
  foodIntolerances: string,
  allergies: string,

  ownContact?: IOwnContact,
  guardianContact?: IGuardianContact,
  emergencyContacts: IEmergencyContact[],

  dayVisitor: boolean,
  dayVisitorArrival: string,
  dayVisitorDeparture: string,
  dayVisitorArrivalMeal: string,
  dayVisitorDepartureMeal: string,

  tshirtSize: string,
  awarenessTraining: string,

  staffDays: string[],
  staffProfession: string,
  staffLanguages: string[],
  staffLanguagesOther: string,

  staffQualDrivingLicense: string,
  staffQualChainsawLicense: boolean,
  staffQualProfessionalDriver: boolean,
  staffQualElectrician: boolean,
  staffQualOther: string,

  staffBackgroundCheck: boolean,
  staffFancyAwarenessThingy: boolean,
  staffInsured: boolean,
  staffHasTent: boolean,
  staffTentExtra: string,
  staffOnsiteGuardian: string,
  staffChildcare: string[],
  staffType: string,
  staffSubtype: string,
  staffSubcamp: string,

  staffFreeDayVisitor: boolean,

  medicalSheet: boolean,
  pictureAgreement: boolean,
  gdprAgreed: boolean,
  agbAgreed: boolean,
}

const defaultValues: IParticipantSignup = {
  group: "",
  fullName: "",
  gender: "",
  parentOrg: "",
  parentOrgOther: "",
  dateOfBirth: "",
  type: "",
  rank: "",
  rankLeader: "",
  smallChildRef: "",
  rate: "",
  familyMember: "",

  ownContact: {
    fullName: "",
    address: "",
    phone: "",
    email: "",
  },
  guardianContact: {
    fullName: "",
    address: "",
    phone: "",
    email: "",
    misc: "",
  },
  emergencyContacts: [
    {
      fullName: "",
      role: "",
      address: "",
      phone: "",
      email: "",
      misc: "",
    }
  ],

  dayVisitor: false,
  dayVisitorArrival: "",
  dayVisitorDeparture: "",
  dayVisitorArrivalMeal: "",
  dayVisitorDepartureMeal: "",

  foodOptions: "",
  maySwim: false,

  requiredMedecine: "",
  foodIntolerances: "",
  allergies: "",

  tshirtSize: "",
  awarenessTraining: "",

  staffDays: [],
  staffProfession: "",
  staffLanguages: [],
  staffLanguagesOther: "",

  staffQualDrivingLicense: "",
  staffQualChainsawLicense: false,
  staffQualProfessionalDriver: false,
  staffQualElectrician: false,
  staffQualOther: "",

  staffBackgroundCheck: false,
  staffFancyAwarenessThingy: false,
  staffInsured: false,
  staffHasTent: false,
  staffTentExtra: "",
  staffOnsiteGuardian: "",
  staffChildcare: [],
  staffType: "",
  staffSubtype: "",
  staffSubcamp: "",

  staffFreeDayVisitor: false,

  pictureAgreement: false,
  agbAgreed: false,
  medicalSheet: false,
  gdprAgreed: false,
};

interface IGroupData {
  id: string,
  priceAdjustments: { [s: string]: number };
  name: string;
  mixedOrg: boolean;
  parentOrg: string;
  allowEarlyDeparture: boolean,
  communalEarlyDeparture: boolean,
  requireEarlyDeparture: boolean,
  extraText: string;
}

export const ParticipantSignupPage: React.FC = () => {
    const apiEndpoint: String = process.env.NODE_ENV === "development" ? 'http://localhost:8000/api/v1' : 'https://backend.anmeldung-test.farbenmeehr2020.de/api/v1';
    const t = useTranslation();

    const {groupID} = useParams();

    const [groupData, setGroupData] = React.useState<IGroupData>();
    const [errorMessage, setErrorMessage] = React.useState("");
    const [progressMessage, setProgressMessage] = React.useState("");
    const [success, setSuccess] = React.useState("");
    const [printTouched, setPrintTouched] = React.useState(false);
    const [loggedInAs, setLoggedInAs] = React.useState("");
    const [loggedIn, setLoggedIn] = React.useState(false);

    function handleLoggedInChange(value: boolean) {
      setLoggedIn(value);
    }

    React.useEffect(() => {
      axios.get(`${apiEndpoint}/groups/${groupID}/`)
      .then((res) => {
        setGroupData(res.data as IGroupData);
      })
      .catch((err:Error) => {
        console.error(err);
        setGroupErrorMessage(err.message)
      })
    }, [])


    const formatDate = (date: string) => {
      let d = moment(date, "DD.MM.YYYY").format("YYYY-MM-DD");
      console.log(d);
      return d;
  }

    const [groupErrorMessage, setGroupErrorMessage] = React.useState("");

    const termsOfServiceLink = (t({
      de: <a href="https://farbenmeehr2020.de/de/agb" target="_blank" rel="noopener noreferrer">AGB</a>,
      en: <a href="https://farbenmeehr2020.de/en/agb" target="_blank" rel="noopener noreferrer">Terms of Service</a>,
    }));

    const selfDeclarationLink = (t({
      de: <a
        href="https://firebasestorage.googleapis.com/v0/b/farbenmeehr2020-dev.appspot.com/o/static%2FSelbstverpflichtungserklaerung_Verantwortliche.pdf?alt=media"
        target="_blank" rel="noopener noreferrer">Selbstverpflichtungserklärung</a>,
      en: <a
        href="https://firebasestorage.googleapis.com/v0/b/farbenmeehr2020-dev.appspot.com/o/static%2FSelbstverpflichtungserklaerung_Verantwortliche_ENG.pdf?alt=media&token=4e09cd47-b63b-462e-8376-6b0a5846de1d"
        target="_blank" rel="noopener noreferrer">Declaration of Committment</a>,
    }));

    const medicalSheetLink = (t({
      de: <a
        href="https://firebasestorage.googleapis.com/v0/b/farbenmeehr2020-dev.appspot.com/o/static%2FGesundheitsbogen_FarbenmEEHr.pdf?alt=media"
        target="_blank" rel="noopener noreferrer">Gesundheitsbogen</a>,
      en: <a
        href="https://firebasestorage.googleapis.com/v0/b/farbenmeehr2020-dev.appspot.com/o/static%2FGesundheitsbogen_FarbenmEEHr.pdf?alt=media"
        target="_blank" rel="noopener noreferrer">medical sheet</a>,
    }));

    const picturePermissionLink = (t({
      de: <a
        href="https://firebasestorage.googleapis.com/v0/b/farbenmeehr2020-dev.appspot.com/o/static%2FFarbenmEEHr_Vereinbarung%20zur%20Fotonutzung.pdf?alt=media"
        target="_blank" rel="noopener noreferrer">Fotonutzungsformular</a>,
      en: <a
        href="https://firebasestorage.googleapis.com/v0/b/farbenmeehr2020-dev.appspot.com/o/static%2FFarbenmEEHr_Vereinbarung%20zur%20Fotonutzung.pdf?alt=media"
        target="_blank" rel="noopener noreferrer">Photo usage form</a>,
    }));

    const visitorDayOptions = [
      '02.08.2021',
      '03.08.2021',
      '04.08.2021',
      '05.08.2021',
      '06.08.2021',
      '07.08.2021',
      '08.08.2021',
      '09.08.2021',
      '10.08.2021',
      '11.08.2021',
      '12.08.2021',
    ]

    const mail = (address: string) => (
      <a href={"mailto:" + address}>{address}</a>
    );

    const [storedValues, setStoredValues] = React.useState<IParticipantSignup>(() => {
      const storedData = localStorage.getItem('participantSignupState');

      if (storedData == null) {
        return defaultValues;
      } else {
        try {
          let parse = JSON.parse(storedData);
          parse.rate = "";
          return parse;
        } catch (e) {
          return defaultValues;
        }
      }
    });

    React.useEffect(() => {
      localStorage.setItem('participantSignupState', JSON.stringify(storedValues));
      // Do not set Sentry extra data for privacy reasons
    }, [storedValues]);

    const selectPlaceholder = (
      <FormSelectOption key="placeholder" value="" label={t({
        de: "Bitte auswählen",
        en: 'Please choose',
      })} isDisabled/>
    );

    const parentOrgOther = t({
      de: 'Sonstige',
      en: 'Other',
    });

    const tshirtSizes = [
      '122-128', '134-140', '146-154',
      'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'
    ];

    const parentOrgs = [...parentOrgsStatic, parentOrgOther];

    const calculateAge: (values: IParticipantSignup) => boolean = (values) => {
      const parsedDateOfBirth = moment(values.dateOfBirth, 'DD.MM.YYYY', true);
      const dateNow = moment();

      if (!parsedDateOfBirth.isValid()) {
        // form field not yet filled out, or invalid
        return false;
      } else {
        return is18AtDate(parsedDateOfBirth, dateNow);
      }
    };

    const calculateAgeEndOfCamp: (values: IParticipantSignup) => boolean = (values) => {
      const parsedDateOfBirth = moment(values.dateOfBirth, 'DD.MM.YYYY', true);
      const endOfCampDate = moment("2021-08-12");

      if (!parsedDateOfBirth.isValid()) {
        // form field not yet filled out, or invalid
        return false;
      } else {
        return is18AtDate(parsedDateOfBirth, endOfCampDate);
      }
    };

    const is18AtDate: (dateOfBirth: moment.Moment, endDate: moment.Moment) => boolean = (dateOfBirth, endDate) => {
      let age = moment.duration(dateOfBirth.diff(endDate)).abs().asYears();
      return age >= 18;
    };

    const isType = (values: IParticipantSignup, type: (keyof typeof participantTypeMap)) => (
      values.type === type
    );

    let mainEventDays = [{
        key: "02.08.",
        text: t({
          de: "02.08. (Hauptveranstaltung)",
          en: "02.08. (Main event)",
        })
      },
      {
        key: "03.08.",
        text: t({
          de: "03.08. (Hauptveranstaltung)",
          en: "03.08. (Main event)",
        })
      },
      {
        key: "04.08.",
        text: t({
          de: "04.08. (Hauptveranstaltung)",
          en: "04.08. (Main event)",
        })
      },
      {
        key: "05.08.",
        text: t({
          de: "05.08. (Hauptveranstaltung)",
          en: "05.08. (Main event)",
        })
      },
      {
        key: "06.08.",
        text: t({
          de: "06.08. (Hauptveranstaltung)",
          en: "06.08. (Main event)",
        })
      },
      {
        key: "07.08.",
        text: t({
          de: "07.08. (Hauptveranstaltung)",
          en: "07.08. (Main event)",
        })
      },
      {
        key: "08.08.",
        text: t({
          de: "08.08. (Hauptveranstaltung)",
          en: "08.08. (Main event)",
        })
      },
      {
        key: "09.08.",
        text: t({
          de: "09.08. (Hauptveranstaltung)",
          en: "09.08. (Main event)",
        })
      },
      {
        key: "10.08.",
        text: t({
          de: "10.08. (Hauptveranstaltung)",
          en: "10.08. (Main event)",
        })
      },
      {
        key: "11.08.",
        text: t({
          de: "11.08. (Hauptveranstaltung)",
          en: "11.08. (Main event)",
        })
      },
      {
        key: "12.08.",
        text: t({
          de: "12.08. (Hauptveranstaltung)",
          en: "12.08. (Main event)",
        })
      }];

    const dayTypes = (showMainEvent: boolean) => [
      {
        key: "26.07.",
        text: t({
          de: "26.07. (Aufbau)",
          en: "26.07. (Build-up)",
        })
      },
      {
        key: "27.07.",
        text: t({
          de: "27.07. (Aufbau)",
          en: "27.07. (Build-up)",
        })
      },
      {
        key: "28.07.",
        text: t({
          de: "28.07. (Aufbau)",
          en: "28.07. (Build-up)",
        })
      },
      {
        key: "29.07.",
        text: t({
          de: "29.07. (Aufbau)",
          en: "29.07. (Build-up)",
        })
      },
      {
        key: "30.07.",
        text: t({
          de: "30.07. (Aufbau)",
          en: "30.07. (Build-up)",
        })
      },
      {
        key: "31.07.",
        text: t({
          de: "31.07. (Aufbau)",
          en: "31.07. (Build-up)",
        })
      },
      {
        key: "01.08.",
        text: t({
          de: "01.08. (Aufbau)",
          en: "01.08. (Build-up)",
        })
      },
      ...(showMainEvent ? mainEventDays : []),
      {
        key: "13.08.",
        text: t({
          de: "13.08. (Abbau)",
          en: "13.08. (Teardown)",
        })
      },
      {
        key: "14.08.",
        text: t({
          de: "14.08. (Abbau)",
          en: "14.08. (Teardown)",
        })
      },
      {
        key: "15.08.",
        text: t({
          de: "15.08. (Abbau)",
          en: "15.08. (Teardown)",
        })
      },
    ]

    const calculateFieldDependencies: (values: IParticipantSignup) => Map<keyof IParticipantSignup, boolean> = (values) => (
      new Map<keyof IParticipantSignup, boolean>([
        ["parentOrgOther", values.parentOrg === parentOrgOther],
        ["smallChildRef", isType(values, "small_child")],
        ["rank", isType(values, "regular")],
        ["rankLeader", isType(values, "leader")],
        ["maySwim", !calculateAge(values)],
        ["awarenessTraining", isType(values, "leader") || isType(values, "staff") || calculateAgeEndOfCamp(values)],
        ["ownContact", isType(values, "leader") || isType(values, "staff") || calculateAge(values)],
        ["guardianContact", !calculateAge(values)],
        ["staffOnsiteGuardian", !calculateAge(values)],
        ["staffTentExtra", values.staffHasTent],
        ["familyMember", /^family-/.test(values.rate)],
        ["tshirtSize", !(values.dayVisitor || isType(values, "staff"))],
        ["gender", !(values.dayVisitor || isType(values, "staff"))],  /* this is now a tshirt field */
        ["dayVisitorArrival", values.dayVisitor && !values.staffFreeDayVisitor],
        ["dayVisitorDeparture", values.dayVisitor && !values.staffFreeDayVisitor],
        ["dayVisitorArrivalMeal", values.dayVisitor && !values.staffFreeDayVisitor],
        ["dayVisitorDepartureMeal", values.dayVisitor && !values.staffFreeDayVisitor],
      ]));

    const staffForm = (values: IParticipantSignup) => (<React.Fragment>
      <Text component="h2">
        {t({
          de: <>Zusatzdaten für Helfende</>,
          en: <>Extra data for staff</>,
        })}</Text>

      <Text>
        {t({
          de: <>
            Bei Fragen {mail("helfende@farbenmeehr2020.de")} kontaktieren. Helfende reisen entweder mit ihrem Stamm
            an und werden in ihrem Stamm verpflegt und untergebracht, oder melden sich im Helfendenstamm an.
          </>,
          en: <>
            Contact {mail("helfende@farbenmeehr2020.de")} in case of questions.
          </>,
        })}
      </Text>

      <MultiChoiceField
        label={t({
          de: "An welchen Tagen stehst du als Helfer*in zur Verfügung?",
          en: "Which days are you available as a staff member?",
        })}
        isRequired
        name="staffDays"
        choices={dayTypes(!values.staffFreeDayVisitor)}
      />

      <TextField
        label={t({
          de: "Ausgeübt(e) Beruf(e) (oder Studiengang)",
          en: "Profession (or studies)",
        })}
        name="staffProfession"
      />

      <MultiChoiceField
        label={t({
          de: "Sprachen (sehr gut bis fließend)",
          en: "Spoken Languages (very good/fluent)",
        })}
        name="staffLanguages"
        choices={[
          {
            key: "German",
            text: t({
              de: "Deutsch",
              en: "German",
            })
          },
          {
            key: "English",
            text: t({
              de: "Englisch",
              en: "English",
            })
          },
          {
            key: "Spanish",
            text: t({
              de: "Spanisch",
              en: "Spanish",
            })
          },
          {
            key: "French",
            text: t({
              de: "Französisch",
              en: "French",
            })
          },
        ]}
        isRequired
      />

      <TextField
        label={t({
          de: "Sonstige Sprachen",
          en: "Other languages",
        })}
        name="staffLanguagesOther"
        helperText={t({
          de:
            <>
            </>,
          en:
            <>
            </>,
        })}
      />

      <SelectField
        helperText={t({
          de:
            <>
            </>,
          en: <>
          </>,
        })}
        label={t({
          de: "Höchstwertigste Führerscheinklasse",
          en: "Highest Driver's License Class",
        })}
        isRequired
        name="staffQualDrivingLicense"
      >
        {selectPlaceholder}
        {driversLicenses.map((org, index) => (
          <FormSelectOption key={index} value={org} label={org}/>
        ))}
      </SelectField>

      <BooleanField
        name="staffQualChainsawLicense"
        helperText={
          t({
            de: <>
            </>,
            en: <>
            </>,
          })
        }
        label={t({
          de: "Kettensägenschein mit persönlicher Schutzausrüstung vorhanden",
          en: "I possess a Chainsaw Operator's License and personal protective equipment",
        })}/>

      <BooleanField
        name="staffQualProfessionalDriver"
        helperText={
          t({
            de: <>
            </>,
            en: <>
            </>,
          })
        }
        label={t({
          de: "Personenbeförderungsschein vorhanden",
          en: "I'm a professional driver",
        })}/>

      <BooleanField
        name="staffQualElectrician"
        helperText={
          t({
            de: <>
            </>,
            en: <>
            </>,
          })
        }
        label={t({
          de: "Elektrikerausbildung vorhanden",
          en: "I'm a trained electrician",
        })}/>

      <TextField
        label={t({
          de: "Sonstige relevante Qualifikationen",
          en: "Other relevant qualifications/skills",
        })}
        name="staffQualOther"
        helperText={t({
          de:
            <>
            </>,
          en:
            <>
            </>,
        })}
      />
      <BooleanField
        name="staffInsured"
        helperText={
          t({
            de: <>
               Wenn du Mitglied in einem Pfadfinderinnenverband oder einer anderen Institution bist, bist du dort versichert. 
               Wenn du kein Mitglied in einem Pfadfinderinnenverband bist, kannst du eine kostenlose Schnuppermitgliedschaft bei der DPSG 
               abschließen oder du hast eine private Haftpflichtversicherung. Eine Haftpflichtversicherung ist zwingend erforderlich.
            </>,
            en: <>
            </>,
          })
        }
        isRequired
        label={t({
          de: "Ich bin haftpflichtversichert.",
          en: "I have personal or institutional liability insurance.",
        })}/>
      <BooleanField
        name="staffHasTent"
        helperText={
          t({
            de: <>
              Bitte nach Möglichkeit ein eigenes Zelt mitbringen. Am besten ist Dein Zelt
              groß genug, um andere Helfende ohne Zelt mit unterzubringen.

              Falls Du kein Zelt mitbringst, werden wir einen Platz für Dich finden.
            </>,
            en: <>
              Please bring your own tent, if you can. Ideally, your tent would have extra
              space for other staff members who cannot bring their own.

              If you do not bring a tent, we'll find a place to sleep for you.
            </>,
          })
        }
        label={t({
          de: "Ich bringe ein eigenes Zelt mit.",
          en: "I'm bringing my own tent.",
        })}/>

      {calculateFieldDependencies(values).get("staffTentExtra") && <TextField
          label={t({
            de: "Falls weitere Plätze im Zelt vorhanden sind, hier Anzahl angeben",
            en: "",
          })}
          name="staffTentExtra"
      />}
      {calculateFieldDependencies(values).get("staffOnsiteGuardian") && <TextField
          label={t({
            de: "Name der ebenfalls anwesenden Aufsichtsperson",
            en: "Name of legal guardian who is also present on site",
          })}
          name="staffOnsiteGuardian"
          isRequired
          helperText={t({
            de:
              <>
                Es gilt das Jugendschutzgesetz.
              </>,
            en:
              <>
              </>,
          })}
      />}
      <MultiChoiceField
        label={t({
          de: "Kinderbetreuung an den folgenden Tagen benötigt?",
          en: "I need child care on these days",
        })}
        helperText={t({
          de:
            <>
              Alle mitgebrachten Kinder müssen separat zum Lager angemeldet werden.
            </>,
          en:
            <>
              If you bring children, you have to register them as separate participants.
            </>,
        })}
        name="staffChildcare"
        choices={dayTypes(!values.staffFreeDayVisitor)}
      />
      <SelectField
        label={t({
          de: "Helfendenkategorie",
          en: "Staff category",
        })}
        name="staffType"
        helperText={t({
          de:
            <>
              Du solltest bereits wissen, in welchem Unterlager und Bereich Du dich engagieren wirst.
              Falls Du nicht zu einem bestimmten Bereich oder Unterlager gehörst, kannst Du dich als
              Springer ohne feste Zuordnung anmelden. Weitere Informationen zu den einzelnen Unterlagern
              gibt es beim jeweiligen Team.
            </>,
          en:
            <>
              You should already know which subcamp or group you belong to. You can get more information
              from the respective groups. If you do not have any particular group in mind, you can also
              register for the jumper pool.
            </>,
        })}
        isRequired
      >
        {selectPlaceholder}
        {Object.entries(staffTypes).map(([key, value], index) => (
          <FormSelectOption key={index} value={key} label={t(value)}/>
        ))}
      </SelectField>

      {values.staffType === "subcamp" && <SelectField
          label={t({
            de: "Mithilfe in Unterlager",
            en: "Subcamp staff",
          })}
          isRequired
          name="staffSubcamp"
      >
        {selectPlaceholder}
        {placementGroups.map((org, index) => (
          <FormSelectOption key={index} value={org} label={org}/>
        ))}
      </SelectField>}

      {values.staffType === "central" && <SelectField
          label={t({
            de: "Mithilfe in der zentralen Organisation",
            en: "Staff with the central team",
          })}
          name="staffSubtype"
          isRequired
      >
        {selectPlaceholder}
        {Object.entries(staffSubtypes).map(([key, value], index) => (
          <FormSelectOption key={index} value={key} label={t(value)}/>
        ))}
      </SelectField>}

    </React.Fragment>);

    const signupDetail = (
      <>
        <PageSection variant={PageSectionVariants.light}>
          <TextContent>
            <Bullseye>
              <Text component={TextVariants.h1}>
                {t({
                  de: <>Teilnehmendenanmeldung</>,
                  en: <>Participant registration</>,
                })}
              </Text>
            </Bullseye>
            <Bullseye>
              <Text component={TextVariants.h2}>
                {groupData && groupData.name}
              </Text>
            </Bullseye>
            <Text className="hidePrint">
              {t({
                de:
                  <>
                    <Text>
                      Herzlich Willkommen bei der Anmeldung zu unserem Ringelager "FarbenmEEHr 2020 - Vielfalt erleben".
                    </Text>
                    <Text>
                      Dieses Lager wird vom <i>Ringe deutscher Pfadfinderinnen- und Pfadfinderverbände Baden-Württemberg
                      e.V.
                    </i> veranstaltet.
                    </Text>
                    <Text>
                      Mit diesem Formular können Teilnehmende verbindlich zum "FarbenmEEHr 2020 - Vielfalt erleben" vom
                      02.08. bis 12.08.2021 angemeldet werden.
                    </Text>
                    <Text>
                      Den Link zu dieser Seite habt ihr von eurem Stamm bekommen. Dadurch meldet ihr euch automatisch über
                      diesen Stamm an.
                      Verantwortliche Personen des Stammes können die Angaben einsehen und bei Bedarf korrigieren.
                    </Text>
                    <Text>
                      Leiter*innen und volljährige Teilnehmende füllen das Formular selbst aus, ansonsten
                      die Erziehungsberechtigten.
                    </Text>
                    <Text>
                      Bei Rückfragen könnt ihr entweder euren Stamm, oder <a
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
                      Bis bald in Königseggwald, wir freuen uns auf euch!
                      <br/>
                      Euer Vorbereitungsteam
                    </Text>
                  </>,
                en:
                  <>
                    <Text>
                      Welcome to the participant registration tool for the "FarbenmEEHr 2020 - Vielfalt erleben" camp,
                      organized by the <i>Ringe deutscher Pfadfinderinnen- und Pfadfinderverbände Baden-Württemberg
                      e.V.
                    </i> organization in Germany.
                    </Text>
                    <Text>
                      This link that you have received from your group automatically links your registration to your
                      group. Your group's leaders can view and, if necessary, edit your information
                    </Text>
                    <Text>
                      Leaders and participants 18 years or older fill out the form on their own.
                      Otherwise, the form has to be completed by the participant's legal guardian(s).
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
                      See you soon in Königseggwald, we look forward to meet you!
                      <br/>
                      Best, your camp preparation team.
                    </Text>
                  </>,
              })}
            </Text>
            {(groupData && groupData.extraText !== "") &&
            <>
                <Text>
                  {t({
                    de:
                      <>
                        Dein Stamm hat zusätzliche Informationen zur Anmeldung hinterlegt:
                      </>,
                    en:
                      <>
                        Your group has specified additional information:
                      </>,
                  })}
                </Text>
                <Text component={TextVariants.blockquote}>
                  {groupData && groupData.extraText.split('\n').map((item, key) => {
                    return <React.Fragment key={key}>{item}<br/></React.Fragment>
                  })}
                </Text>
            </>}
          </TextContent>
        </PageSection>
        <PageSection variant={PageSectionVariants.light}>
          <TextContent>
            <Formik<IParticipantSignup>
              initialValues={storedValues}
              onSubmit={async (values: IParticipantSignup) => {
                let filteredValues: IParticipantSignup = defaultValues;
                const fieldVisibilityMap = calculateFieldDependencies(values);

                for (let key in values) {
                  const visibility = fieldVisibilityMap.get(key as keyof IParticipantSignup);

                  if ((visibility === undefined) || visibility) {
                    const value = values[key as keyof IParticipantSignup];
                    if (value !== undefined) {
                      filteredValues = {...filteredValues, [key as keyof IParticipantSignup]: value};
                    }
                  }
                }

                const ownContactDetails = calculateAge(values) || isType(values, "leader")

                const fullName = ownContactDetails ? values.fullName : (values.guardianContact && values.guardianContact.fullName)

                const email = (ownContactDetails ? values.ownContact!.email : values.guardianContact!.email).trim()

                const dateOfBirthFormat = formatDate(values.dateOfBirth);
                const dayVisitorArrivalFormat = values.dayVisitorArrival === "" ? null : formatDate(values.dayVisitorArrival);
                const dayVisitorDepartureFormat = values.dayVisitorDeparture === "" ? null : formatDate(values.dayVisitorDeparture);
                const guardianContact = fieldVisibilityMap.get("guardianContact") ? values.guardianContact : null;
                const rank = values.rank === "" ? null : values.rank;

                
                if(!loggedIn){
                  throw new Error("not logged In");
                }

                  axios.post(apiEndpoint + '/participants/', 
                  {
                    ...filteredValues, 
                    dateOfBirth: dateOfBirthFormat, 
                    dayVisitorArrival: dayVisitorArrivalFormat, 
                    dayVisitorDeparture: dayVisitorDepartureFormat,
                    group: groupID,
                    ownContact: {
                      ...values.ownContact,
                      fullName
                    },
                    guardianContact,
                    participantType: values.type,
                    rank
                  },
                  {
                    headers: { 'Authorization': `Bearer ${JSON.parse(window.localStorage.token)}` },
                    withCredentials: true
                    })
                  .then((res) => {
                    setSuccess(res.data.id);
                    setErrorMessage("")
                    setProgressMessage("")

                    if (process.env.NODE_ENV !== "development") {
                      setStoredValues(defaultValues);
                    }
                  })
                  .catch(function (e:Error) {
                    console.error(e);
                    setErrorMessage(e.message);
                  });
              }}
              // validateOnChange={false}  // expensive - only on blur
              validate={values => {
                setStoredValues(values);

                if (calculateAge(values as IParticipantSignup) && values.emergencyContacts && values.emergencyContacts.length === 0) {
                  return {
                    emergencyContacts: t({
                      de: "Es muss mindestens ein Notfallkontakt angegeben sein.",
                      en: "At least one emergency contact has to be specified."
                    })
                  }
                }
              }}
              render={({errors, values, isValid, submitForm, resetForm, submitCount, setFieldValue, isSubmitting, validateForm, setFieldTouched}) => {
                let rankMap: { [i: number]: string };

                if (/^PSG/.test(values.parentOrg)) {
                  rankMap = {
                    1: "Wichtel (ab 6 Jahren)",
                    2: "Pfadis (ab 10 Jahren)",
                    3: "Caravelle (ab 13 Jahren)",
                    4: "Ranger (ab 16 Jahren)",
                  }
                } else if (/^International/.test(values.parentOrg)) {
                  rankMap = {
                    1: "Cubs (6 years or older)",
                    2: "Scouts (10 years or older)",
                    3: "Venturing (13 years or older)",
                    4: "Rover (16 years or older)",
                  }
                } else if (/^BdP/.test(values.parentOrg)) {
                  rankMap = {
                    1: "Wölflinge (ab 7 Jahren)",
                    3: "Pfadfinder (ab 11 Jahren)",
                    4: "Ranger & Rover (ab 16 Jahren)",
                  }
                } else if (/^VCP/.test(values.parentOrg)) {
                  rankMap = {
                    1: "Wölflinge (ab 6 Jahren)",
                    2: "Jungpfadfinder (ab 10 Jahren)",
                    3: "Pfadfinder (ab 13 Jahren)",
                    4: "Rover (ab 16 Jahren)",
                  }
                } else {
                  // DPSG, and misc
                  rankMap = {
                    1: "Wölflinge (ab 6 Jahren)",
                    2: "Jungpfadfinder (ab 9 Jahren)",
                    3: "Pfadfinder (ab 12 Jahren)",
                    4: "Rover (ab 16 Jahren)",
                  }
                }

                const isMature = calculateAge(values);
                const fieldVisibilityMap = calculateFieldDependencies(values);

                const m = (a: React.ReactNode, b: React.ReactNode) => (isMature ? a : b);

                if (groupData && values.parentOrg === "") {
                  setFieldValue("parentOrg", groupData.parentOrg)
                }

                return (
                  <Form>
                    {loggedInAs !== "" &&
                    <Alert
                        variant="info"
                        isInline
                        className="hidePrint"
                        title="Login">
                      {t({
                        de: <>
                          Sie sind mit der folgenden E-Mail-Adresse eingeloggt: {loggedInAs}.
                          Falls das nicht korrekt ist, loggen Sie sich hier aus, bevor Sie mit der Anmeldung fortfahren:
                        </>,
                        en: <>
                          You're already logged in using this email address: {loggedInAs}.
                          If this is incorrect, please log out before proceeding:
                        </>,
                      })}
                      {/*
                        <p>
                            <Button variant="tertiary" style={{marginTop: "10px"}} onClick={() => {
                              firebase.auth().signOut()
                              window.location.reload()
                            }}>Logout</Button>
                        </p>
                      */}
                    </Alert>}
                    {success === "" && <>
                      {t({
                        de: <Text className="hidePrint">
                          Alle Felder mit <span className="pf-c-form__label-required">*</span> müssen ausgefüllt
                          werden.
                        </Text>,
                        en: <Text className="hidePrint">
                          All fields marked with <span className="pf-c-form__label-required">*</span> are required.
                        </Text>,
                      })}
                        <TextField
                            isRequired
                            label={t({
                              de: "Vor- und Nachname des Teilnehmenden",
                              en: "First name and surname of the participant",
                            })}
                            name="fullName"/>
                        <TextField
                            label={t({
                              de: "Geburtsdatum",
                              en: "Date of birth (dd.mm.yyyy)",
                            })}
                            helperText={t({
                              de: "Zur Überprüfung der Volljährigkeit.",
                              en: "Will be used to determine your age.",
                            })}
                            name="dateOfBirth"
                            placeholder={"01.01.1999"}
                            validate={(value: string) => {
                              const date = moment(value, 'DD.MM.YYYY', true);
                              if (!date.isValid()) {
                                return t({
                                  de: "Bitte ein gültiges Datum im Format 01.12.1999 eingeben.",
                                  en: "Please enter a valid date (DD-MM-YYYY).",
                                })
                              }
                            }}
                        />
                      {groupData && groupData.mixedOrg && <SelectField
                          helperText={t({
                            de:
                              <>
                                Am FarbenmEEHr werden Pfadfinder*innen unterschiedlicher Verbände teilnehmen.
                                Der Stamm hat für jede Gruppe die Verbandszugehörigkeit angegeben.
                                Allerdings wird es auch Stämme geben, die mit Mitgliedern unterschiedlicher Verbände
                                anreisen.

                                Falls {m("Du", "Ihr Kind")} selbst in einem anderen Verband
                                Mitglied {m("bist", "ist")},
                                als vom Stamm voreingestellt, so {m("gebe", "geben Sie")} das hier bitte an.
                                Bei Unsicherheiten den voreingestellten Verband stehen lassen.
                              </>,
                            en: <>
                              If {m("you are", "your child is")} member of a different parent organization than your
                              group's default, please specify it here. If in doubt, leave as-is.
                            </>,
                          })}
                          label={t({
                            de: "Verbandszugehörigkeit",
                            en: "Association membership",
                          })}
                          isRequired
                          name="parentOrg"
                      >
                        {selectPlaceholder}
                        {parentOrgs.map((org, index) => (
                          <FormSelectOption key={index} value={org} label={org}/>
                        ))}
                      </SelectField>}
                      {fieldVisibilityMap.get("parentOrgOther") &&
                      <TextField
                          isRequired
                          label={t({de: "Name des Verbands", en: "Parent organization's name"})}
                          name="parentOrgOther"
                      />}
                        <SelectField
                            label={t({
                              de: "Teilnehmerkategorie",
                              en: "Signup category",
                            })}
                            name="type"
                            onChange={() => {
                              // Invalidate rate field to prevent inconsistent UI state when options change
                              // Any other dynamic UI state is dealt with by fieldVisibilityMap, but in
                              // this case we need to manually ensure consistency.
                              setFieldValue("rate", "");
                            }}
                            isRequired
                        >
                          {selectPlaceholder}
                          {Object.entries(participantTypeMap).map((value, index) => (
                            <FormSelectOption key={index} value={value[0]} label={t(value[1])}/>
                          ))}
                        </SelectField>
                      {t({
                        de: <TextContent className="hidePrint">
                          <Text>
                            Hier gebt ihr an, welche Rolle ihr auf dem Lager haben werdet:
                          </Text>
                          <Text>
                            <b>Stammesmitglied (außer Leiter*innen)</b>: Diese Kategorie ist für alle, die als "Kinder"
                            mit auf das Lager fahren und am Programm teilnehmen möchten.
                          </Text>
                          <Text>
                            <b>Leiter*in</b>: Diese Kategorie ist für alle, die mit ihrem Stamm auf das Lager fahren,
                            eine leitende Funktion haben und damit Verantwortung für die Teilnehmenden des Stammes
                            übernehmen.
                          </Text>
                          <Text>
                            <b>Kinder unter 6 Jahren</b>: Die Kategorie "Kinder unter sechs Jahren" ist nur für Kinder
                            gedacht, die kostenfrei mit einer erziehungsberechtigten Person anreisen und nicht am Programm
                            teilnehmen.
                            Bitte geben Sie hier die separat angemeldete erziehungsberechtigte Person an, mit der Ihr Kind
                            anreist.
                            Ist dies nicht zutreffend, so melden Sie Ihr Kind bitte als Stammesmitglied in der Altersstufe
                            Wichtel bzw. Wölfling an.
                          </Text>
                          <Text>
                            <b>Ehemalige</b>: Diese Kategorie ist für Ehemalige, die zu ihrem eigenen Vergnügen am Lager
                            teilnehmen,
                            zum Beispiel Familien und Freunde, die im Familienteillager unterkommen.
                            Für Ehemalige ist die Teilnahme am Programm nicht vorgesehen.
                          </Text>
                        </TextContent>,
                        en: <TextContent className="hidePrint">
                          <Text>
                            Here, please indicate your role during the event:
                          </Text>
                          <Text>
                            <b>Regular group member (except leaders)</b>: This category is for everyone who would like
                            to go to the camp as "children" and participate in the programme.
                          </Text>
                          <Text>
                            <b>Group leader</b>: This category is for group leaders who come to the camp along with
                            their group and have a leadership role: They take responsibility for the members of the tribe.
                          </Text>
                          <Text>
                            <b>Children under the age of six</b>: This category is only intended for children who travel
                            with a parent for free or
                            guardian and do not participate in the programme. If this is not the intention, please
                            register your
                            child as a regular member in the appropriate age group (“cubs”). You will be prompted to enter
                            the
                            name of the - separately registered - legal guardian with whom your child is travelling.
                          </Text>
                          <Text>
                            <b>Alumni</b>: This category is for alumni who participate in the camp for their own pleasure.
                            For example, families and friends who are accommodated in the family camp.
                            There is no provision for alumni to participate in the programme.
                          </Text>
                        </TextContent>,
                      })}
                        <BooleanField
                            name="dayVisitor"
                            onChange={() => {
                              // Invalidate rate field to prevent inconsistent UI state when options change
                              setFieldValue("rate", "");
                            }}
                            helperText={isType(values, "staff") ?
                              t({
                                de: <>
                                  Als Tageshelfer*in zahlst du 10€ pro Nacht. Der Mindestbetrag sind 35€, das Maximum 100€
                                  (der normale Helfendenbeitrag). Auf- und Abbauzeit sind nicht inbegriffen - die Angabe
                                  der Tage bezieht sich auf die Hauptveranstaltung. Wer zum Auf- bzw. Abbau da ist, wählt hier
                                  den ersten bzw. letzten Tag aus. Wer <i>nur</i> zum Auf- und Abbau da ist, zahlt nichts.
                                </>,
                                en: <>
                                  Day staff rate is 10€ per night (at least 35€, at most 100€ - the regular rate).
                                  Buildup and teardown are excluded.
                                </>,
                              })
                              : t({
                                de: <>
                                  Als Tagesgast zahlt ihr immer 35€ pro Nacht und müsst eure An- und Abreise selbstständig
                                  organisieren. Im Preis für Tagesgäste ist kein T-Shirt enthalten.
                                </>,
                                en: <>
                                  With this checkbox you can register as a day visitor. As a day visitor, you always pay
                                  35 Euro per
                                  night, you have to make your own travel arrangements and no camp t-shirt will be
                                  included in the fee.
                                </>,
                              })
                            }
                            label={isType(values, "staff") ? t({
                              de: "Anmeldung als Tageshelfende*r",
                              en: "Register as day staff",
                            }) : t({
                              de: "Anmeldung als Tagesgast",
                              en: "Register as day visitor",
                            })}/>
                      {isType(values, "staff") && values.dayVisitor && <BooleanField
                          name="staffFreeDayVisitor"
                          label={t({
                            de: "Ich bin nur zu Auf- und/oder Abbau da und nehme kostenfrei teil.",
                            en: "I'll only be present for buildup/teardown.",
                          })}/>}
                      {fieldVisibilityMap.get("dayVisitorArrival") && <SelectField
                          label={t({
                            de: "Anreisetag für Tagesgäste und -helfende",
                            en: "Day of arrival for day visitors/helpers",
                          })}
                          name="dayVisitorArrival"
                          isRequired
                      >
                        {selectPlaceholder}
                        {visitorDayOptions.map((value, index) => (
                          <FormSelectOption key={index} value={value} label={value}/>
                        ))}
                      </SelectField>}
                      {fieldVisibilityMap.get("dayVisitorDeparture") && <SelectField
                          label={t({
                            de: "Abreisetag für Tagesgäste und -helfende",
                            en: "Day of departure for day visitors/helpers",
                          })}
                          name="dayVisitorDeparture"
                          isRequired
                      >
                        {selectPlaceholder}
                        {visitorDayOptions.map((value, index) => (
                          <FormSelectOption key={index} value={value} label={value}/>
                        ))}
                      </SelectField>}
                      {fieldVisibilityMap.get("dayVisitorArrivalMeal") && <SelectField
                          label={t({
                            de: "Erste Mahlzeit am Anreisetag für Tagesgäste und -helfende",
                            en: "First meal on arrival day for day visitors/helpers",
                          })}
                          name="dayVisitorArrivalMeal"
                          isRequired
                      >
                        {selectPlaceholder}
                        {Object.entries(dayVisitorMealChoices).map(([key, value], index) => (
                          <FormSelectOption key={index} value={key} label={t(value)}/>
                        ))}
                      </SelectField>}
                      {fieldVisibilityMap.get("dayVisitorDepartureMeal") && <SelectField
                          label={t({
                            de: "Letzte Mahlzeit am Abreisetag für Tagesgäste und -helfende",
                            en: "Least meal on departure day for day visitors/helpers",
                          })}
                          name="dayVisitorDepartureMeal"
                          isRequired
                      >
                        {selectPlaceholder}
                        {Object.entries(dayVisitorMealChoices).map(([key, value], index) => (
                          <FormSelectOption key={index} value={key} label={t(value)}/>
                        ))}
                      </SelectField>}
                      {fieldVisibilityMap.get("smallChildRef") &&
                      <TextField
                          label={t({
                            de: "Name der erziehungsberechtigten Person",
                            en: "Name of parent or legal guardian",
                          })}
                          name="smallChildRef"
                          helperText={t({
                            de:
                              <>
                                Die Kategorie "Kinder unter sechs Jahren" ist nur für Kinder gedacht, die mit
                                einer
                                erziehungsberechtigten Person anreisen und nicht am Programm teilnehmen.
                                Bitte geben Sie hier die separat angemeldete erziehungsberechtigte Person an,
                                mit der
                                Ihr Kind anreist.
                                Ist dies nicht der Fall, so melden Sie Ihr Kind bitte als Stammesmitglied in der
                                Altersstufe Wichtel bzw. Wölfling an.
                              </>,
                            en:
                              <>
                                The category "Children under the age of six" is only intended for children who
                                travel with
                                a parent or guardian and do not participate in the programme. Please enter the
                                name of the
                                parent or legal guardian - who registered separately - and with whom the child
                                is
                                travelling.
                                If this is not the case, please register your child as a regular participant.
                              </>,
                          })}
                          isRequired/>}
                      {fieldVisibilityMap.get("rank") &&
                      <SelectField
                          label={t({
                            de: "Altersstufe",
                            en: "Rank",
                          })}
                          helperText={t({
                            de:
                              <>
                                Das Programm auf dem Lager (und oft auch die Gruppenstunden der Stämme) finden
                                in
                                Altersstufen statt.
                                Die Altersstufen sind in jedem Verband unterschiedlich benannt. Abhängig von dem
                                Verband
                                über den der Teilnehmer angemeldet wird,
                                werden die entsprechenden Bezeichnungen für die Altersstufen angezeigt.
                                Für den Fall, dass Sie nicht wissen, in welcher Altersstufe Ihr Kind ist, haben
                                wir zur
                                Orientierung Altersangaben hinzugefügt.
                                Bitte beachten, dass in den Stämmen die Handhabung abweichen kann. Falls Sie die
                                Altersstufe kennen, in der Ihr Kind sich befindet
                                und diese nicht mit unseren Angaben überanstimmt, wählen Sie bitte die
                                Altersstufe, die
                                Ihr Stamm verwendet!
                              </>,
                            en: <>
                              The camp's programme are tailored according to the participant's age groups.
                              Depending on the parent organization, these have different names and varying age ranges.
                              In case you don't know your child's age group, we have provided typical values.
                              If in doubt, ask your child or your group's leaders.
                            </>,
                          })}
                          name="rank"
                          onChange={() => {
                            // Invalidate rate field to prevent inconsistent UI state when options change.
                            // See comment above on why this has to be done.
                            setFieldValue("rate", "");
                          }}
                          isRequired
                      >
                        {selectPlaceholder}
                        {Object.entries(rankMap).map((value, index) => (
                          <FormSelectOption key={index} value={value[0]} label={value[1]}/>
                        ))}
                      </SelectField>}
                      {fieldVisibilityMap.get("rankLeader") &&
                      <SelectField
                          label={t({
                            de: "Ich leite folgende Altersstufe:",
                            en: "Rank of the members that I lead",
                          })}
                          name="rankLeader"
                          isRequired
                      >
                        {selectPlaceholder}
                          <FormSelectOption key="none" value="0" label={t({
                            de: "Keine Stufenleitung",
                            en: "I'm not leading a rank",
                          })}/>
                        {Object.entries(rankMap).map((value, index) => (
                          <FormSelectOption key={index} value={value[0]} label={value[1]}/>
                        ))}
                      </SelectField>}
                        <SelectField
                            label={t({
                              de: "Tarif",
                              en: "Rate",
                            })}
                            name="rate"
                            isRequired
                        >
                          {selectPlaceholder}
                          {values.dayVisitor ?
                            <FormSelectOption key={0} value={"day"} label={t({
                              de: "35€ pro Nacht — Tagesgäste / spezielle Berechnung für Helfende",
                              en: "35€ per night - Day Visitors / special rate for staff"
                            })}/> :
                            GetTranslatedPricingClasses(t).filter(value => {
                              if (value !== undefined) {
                                if ((value.id === "small-child") && !isType(values, "small_child")) {
                                  return false;
                                } else if ((value.id !== "small-child") && isType(values, "small_child")) {
                                  return false;
                                } else if ((value.id !== "staff") && isType(values, "staff")) {
                                  return false;
                                } else if ((value.id === "staff") && !isType(values, "staff")) {
                                  return false;
                                } else if (value.earlyDeparture && groupData && groupData.allowEarlyDeparture) {
                                  // Early departure is enabled, this is early departure - allow
                                  return value.enabled;
                                } else if (value.earlyDeparture) {
                                  // Otherwise, no early departure.
                                  return false;
                                } else if (
                                  !value.earlyDeparture &&
                                  groupData && groupData.requireEarlyDeparture &&
                                  isType(values, "regular") &&
                                  (values.rank === "1") && (value.id !== "social")) {
                                  // For cubs, also remove any options that aren't early departure if requireEarlyDeparture is set.
                                  // Yes, this means it breaks if we get the DB in an inconsistent state. Yay NoSQL!
                                  return false;
                                } else {
                                  return value.enabled;
                                }
                              }
                            }).map((value, index) => (
                              <FormSelectOption key={index} value={value.id}
                                                label={`${groupData && groupData.priceAdjustments[value.id]}€ — ${value.description}`}/>
                            ))}
                        </SelectField>
                        <TextContent className="hidePrint">
                          {t({
                            de: <>
                              <Text>
                                Hier wählt ihr den für euch passenden Tarif aus.
                              </Text>
                              <Text>
                                Je nachdem, ob der Stamm eine Abreise bereits am 08.08.2021 zulässt,
                                gibt es für diesen Zeitraum einen niedrigeren Beitrag.
                              </Text>
                              <Text>
                                Außerdem können Familien ab dem ersten voll zahlenden Teilnehmenden alle weiteren
                                Familienangehörigen zum Geschwister-/Familienbeitrag anmelden.
                              </Text>
                              <Text>
                                Wir möchten, dass jede*r an unserem Lager teilnehmen kann und finanzielle Gründe nicht
                                dagegen sprechen. Daher könnt ihr einen niedrigeren Sozialpreis unkompliziert auswählen.
                              </Text>
                            </>,
                            en: <>
                              <Text>
                                Here, you can choose the rate that suits you best.
                              </Text>
                              <Text>
                                Depending on whether your group permits early departure on 08.08.2021,
                                there will be a lower contribution for this period you can choose.
                              </Text>
                              <Text>
                                In addition, from the first fully paying participant onwards, families can register all
                                other family
                                members at a lower sibling/family rate.
                              </Text>
                              <Text>
                                We do not want financial issues to stand in the way of participating at our camp.
                                Therefore, you can choose a lower social price at your own discretion.
                              </Text>
                            </>,
                          })}
                        </TextContent>
                      {fieldVisibilityMap.get("familyMember") &&
                      <TextField
                          label={t({
                            de: "Name des angemeldeten Familienmitglieds",
                            en: "Name of the registered family member",
                          })}
                          name="familyMember"
                          helperText={t({
                            de:
                              <>
                                Für die Buchung des Familienpreises muss hier der Name des bereits
                                angemeldeten, den Vollpreis zahlenden Familienmitglieds angegeben werden. Bitte darauf
                                achten,
                                dass der Name exakt übereinstimmt.
                              </>,
                            en:
                              <>
                                In order to take advantage of the siblings/family fee, please specify
                                the name of the family member that is paying the full fee. Make sure the
                                name matches exactly with how they provided it on their form.
                              </>,
                          })}
                          isRequired/>}
                      {groupData && groupData.requireEarlyDeparture && (values.rank === "1") &&
                      <Text>
                        {t({
                          de: <><b>Hinweis:</b> Wichtel/Wölflinge können nur die frühere Abreise wählen.</>,
                          en: <><b>Note:</b> Your group has indicated that cubs must choose early departure.</>,
                        })}
                      </Text>}
                      {groupData && groupData.communalEarlyDeparture && (values.rank === "1") &&
                      <Text>
                        {t({
                          de: <>
                            <b>Hinweis:</b> Der Stamm organisiert eine gemeinsame frühere Abreise von den
                            Wichteln/Wölflingen,
                            die eine frühere Abreise gewählt haben.
                          </>,
                          en: <>
                            <b>Note:</b> Your group is organizing the return trip for cubs who choose early departure -
                            no individual travel arrangements necessary.
                          </>,
                        })}
                      </Text>}
                      {fieldVisibilityMap.get("ownContact") && <>
                          <h1>
                            {t({
                              de: <>Eigene Kontaktdaten</>,
                              en: <>Own contact data</>,
                            })}
                          </h1>
                          <OwnContactForm name="ownContact"/>
                      </>}
                      {fieldVisibilityMap.get("guardianContact") && <>
                          <h1>
                            {t({
                              de: <>Kontaktdaten der/des Erziehungsberechtigten</>,
                              en: <>Contact details of legal guardian(s)</>,
                            })}
                          </h1>
                          <GuardianContactForm name="guardianContact"/>
                      </>}
                        <h1 className="breakBefore">
                          {!isMature ? t({
                            de: <>Weitere Notfallkontakte</>,
                            en: <>Other emergency contacts</>,
                          }) : t({
                            de: <>Notfallkontakte</>,
                            en: <>Emergency contacts</>,
                          })}
                        </h1>
                      {isMature && t({
                        de: <>
                          Die Angabe mindestens eines Notfallkontakts ist notwendig.
                        </>,
                        en: <>
                          You must specify at least one emergency contact.
                        </>,
                      })}
                        <FieldArray name="emergencyContacts" validateOnChange={true} render={arrayHelpers => (
                          <>
                            {values.emergencyContacts && values.emergencyContacts.map((value, index) => (
                              <React.Fragment key={index}>
                                <Card>
                                  <CardHead>
                                    <CardActions>
                                      {!(isMature && values.emergencyContacts && values.emergencyContacts.length <= 1) ?
                                        <Button variant="secondary" className="hidePrint" onClick={() => {
                                          arrayHelpers.remove(index)
                                        }}>
                                          <>{t({de: "Löschen", en: "Delete"})}</>
                                        </Button> : null}
                                    </CardActions>
                                    <CardHeader>
                                      <h2>{value && value.fullName || t({
                                        de: <i>Neuer Kontakt</i>,
                                        en: <i>New Contact</i>,
                                      })}</h2>
                                    </CardHeader>
                                  </CardHead>
                                  <CardBody>
                                    <EmergencyContactForm name={`emergencyContacts.${index}`}/>
                                  </CardBody>
                                </Card>
                              </React.Fragment>))}
                            <Button
                              className="hidePrint"
                              variant="secondary"
                              onClick={() => {
                                arrayHelpers.push({
                                  fullName: "",
                                  role: "",
                                  address: "",
                                  phone: "",
                                  email: "",
                                  misc: "",
                                })
                              }}
                            >
                              {t({de: "Weiteren Notfallkontakt hinzufügen", en: "Add additional emergency contact"})}
                            </Button>
                          </>
                        )}/>
                      {typeof errors.emergencyContacts === "string" &&
                      <Alert variant="danger" isInline title={errors.emergencyContacts}/>}
                        <h1>
                          {t({
                            de: <>Weitere Informationen</>,
                            en: <>Miscellaneous</>,
                          })}
                        </h1>
                      {fieldVisibilityMap.get("tshirtSize") && <SelectField
                          label={t({
                            de: "T-Shirt-Größe",
                            en: "Shirt size (European sizes!)",
                          })}
                          helperText={t({
                            de: 'Im Lagerbeitrag (außer Tagesgäste) ist ein T-Shirt enthalten. Die Größe benötigen wir, um die richtigen Mengen zu bestellen.',
                            en: 'A t-shirt is included in the camp fee (except day visitors). We need the size to order the right quantities.',
                          })}
                          name="tshirtSize"
                          isRequired
                      >
                        {selectPlaceholder}
                        {tshirtSizes.map((value, index) => (
                          <FormSelectOption key={index} value={value} label={value}/>
                        ))}
                      </SelectField>}
                      {fieldVisibilityMap.get("gender") &&
                      <SelectField
                          label={t({
                            de: "T-Shirt-Schnitt",
                            en: "T-shirt cut",
                          })}
                          name="gender"
                          isRequired>
                        {selectPlaceholder}
                        {Object.entries(genders).map((value, index) => (
                          <FormSelectOption key={index} value={value[0]} label={t(value[1])}/>
                        ))}
                      </SelectField>}
                        <TextAreaField
                            label={t({
                              de: <>Medikamente, die {m("ich", "mein Kind")} während des Lagers einnehmen muss</>,
                              en: <>Medecine that {m("I need", "my child needs")} to take during the event</>,
                            })}
                            name="requiredMedecine"
                            helperText={t({
                              de: m(
                                <>
                                  <p>
                                    Bitte gebe hier an, falls Du auf dem Lager regelmäßig Medikamente nehmen musst
                                    oder Medikamente für einen Notfall benötigst (z.B. Notfallspritze bei
                                    Allergien),
                                    und ob ein Medikament gekühlt werden muss.
                                  </p>
                                  <p>
                                    Diese Angaben sind für die verantwortlichen Leiter*innen des Stammes einsehbar.
                                    Am Ende der Anmeldung findest Du einen ausführlichen Gesundheitsbogen.
                                    Dieser ist für Notfälle zur Aushändigung an eine* behandelde*n Arzt*Ärztin
                                    gedacht.
                                    Der gesonderte Gesundheitsbogen wird in einem verschlossenen Umschlag abgegeben
                                    und wird
                                    nur im Notfall geöffnet.
                                    Bitte gebe, falls nötig, Medikamente zwei Mal an: Einmal hier und einmal im
                                    Gesundheitsbogen.
                                  </p>
                                </>,
                                <>
                                  <p>
                                    Bitte geben Sie hier an, falls Ihr Kind auf dem Lager regelmäßig Medikamente
                                    nehmen muss
                                    oder Medikamente für einen Notfall mitbekommt (z.B. Notfallspritze bei
                                    Allergien)
                                    Bitte geben Sie an, falls ein Medikament gekühlt werden muss und ob Ihr Kind die
                                    Medikamente eigenverantwortlich nehmen kann, oder sie von einem Leiter/einer
                                    Leiterin
                                    gegeben werden müssen.
                                  </p>
                                  <p>
                                    Diese Angaben sind für die verantwortlichen Leiter*innen des Stammes einsehbar.
                                    Am Ende der Anmeldung finden Sie einen ausführlichen Gesundheitsbogen.
                                    Dieser ist für Notfälle zur Aushändigung an eine* behandelde*n Arzt*Ärztin
                                    gedacht.
                                    Der gesonderte Gesundheitsbogen wird in einem verschlossenen Umschlag abgegeben
                                    und wird
                                    nur im Notfall geöffnet.
                                    Bitte geben Sie falls nötig Medikamente zwei Mal an: Einmal hier und einmal im
                                    Gesundheitsbogen.
                                  </p>
                                </>),
                              en: m(
                                <>
                                  <p>
                                    Please indicate here any medication you need to take during the camp, either
                                    regularly or in emergency situations (eg. emergency injection for allergies),
                                    and whether your medicines require to be kept refrigerated.
                                  </p>
                                  <p>
                                    This information can be viewed by your group leader. A detailed health questionnaire
                                    can
                                    be found at the end of the registration form. This is intended for the use of medical
                                    staff in
                                    emergency situations. The separate health questionnaire will be provided in a sealed
                                    envelope and
                                    will only be opened in an emergency situation. Where applicable, please provide
                                    details of medicines
                                    twice; both here and in the health questionnaire.
                                  </p>
                                </>,
                                <>
                                  <p>
                                    Please indicate here any medication your child requires to take during the camp,
                                    either regularly or
                                    in emergency situations (eg. emergency injection for allergies). Please indicate
                                    whether any
                                    medicines require to be kept refrigerated and whether your child can administer the
                                    medication by
                                    himself/herself, or whether a leader must administer the medication.
                                  </p>
                                  <p>
                                    This information can be viewed by your group leader. A detailed health questionnaire
                                    can
                                    be found at the end of the registration form. This is intended for the use of medical
                                    staff in
                                    emergency situations. The separate health questionnaire will be provided in a sealed
                                    envelope and
                                    will only be opened in an emergency situation. Where applicable, please provide
                                    details of medicines
                                    twice; both here and in the health questionnaire.
                                  </p>
                                </>),
                            })}
                            rows={3}
                        />
                        <SelectField
                            label={t({
                              de: "Essenswahl",
                              en: "Food choice",
                            })}
                            helperText={t({
                              de: <>{m("Dein", "Ihr")} Stamm benötigt diese Angabe, um die Menge an Essen für das Lager zu
                                planen.</>,
                              en: <>Your group needs this information for planning purposes.</>,
                            })}
                            name="foodOptions"
                            isRequired
                        >
                          {selectPlaceholder}
                          {Object.entries(foodOptions).map((value, index) => (
                            <FormSelectOption key={index} value={value[0]} label={t(value[1])}/>
                          ))}
                        </SelectField>
                        <TextAreaField
                            label={t({
                              de: "Weitere Angaben zur Verpflegung",
                              en: "Further details on food",
                            })}
                            name="foodIntolerances"
                            helperText={t({
                              de: "Bitte hier Lebensmittelallergien, -unverträglichkeiten oder religiöse Aspekte angeben.",
                              en: "Please indicate food intolerances/allergies or religious aspects here.",
                            })}
                            rows={3}
                        />
                        <TextContent className="hidePrint">
                          {t({
                            de: <>
                              <Text>Grundsätzlich werden vegetarische Gerichte und Gerichte mit Fleisch angeboten.</Text>
                              <Text>Außerdem werden den Stämmen vegane, laktosefreie, glutenfreie und einige weitere
                                Produkte zur Verfügung gestellt.</Text>
                              <Text>Bitte gib Besonderheiten an, damit dein Stamm sich frühzeitig auf besondere
                                Bedürfnisse vorbereiten kann.</Text>
                            </>,
                            en: <>
                              <Text>Vegetarian dishes and dishes with meat are offered.</Text>
                              <Text>In addition to that, vegan, lactose-free, gluten-free and some other products are made
                                available to the groups.</Text>
                              <Text>Please indicate specifics so that your tribe can prepare for special requirements at
                                an early stage.</Text>
                            </>,
                          })}
                        </TextContent>
                        <TextAreaField
                            label={t({
                              de: "Sonstige Allergien",
                              en: "Other allergies",
                            })}
                            name="allergies"
                            helperText={t({
                              de: "Bitte hier bekannte Allergien angeben, die den Leiter*innen bekannt sein sollten, wie Insektenstich-Allergien.",
                              en: "Please indicate any other allergies that your group leaders need to know about here.",
                            })}
                            rows={3}
                        />
                      {fieldVisibilityMap.get("maySwim") &&
                      <BooleanField
                          name="maySwim"
                          label={t({
                            de: <>Mein Kind darf unter Beaufsichtigung schwimmen.</>,
                            en: <>My child is allowed to swim under supervision.</>,
                          })}/>}

                      {!fieldVisibilityMap.get("awarenessTraining") &&
                      t({
                        de: <>
                          <TextContent className="hidePrint">
                            <Text component="h2">
                                Prävention
                              </Text>
                              <Text>
                                Pfadfinden – das bedeutet Spaß, Abenteuer, Freunde, Lagerfeuer und für jeden ein bisschen was anderes. 
                                Vor allem aber: gemeinsam eine gute Zeit erleben! Damit Pfadfinden für alle eine tolle Erfahrung wird, 
                                müssen wir achtsam miteinander umgehen, die eigenen Grenzen wahrnehmen und die der anderen nicht übertreten.
                              </Text>
                              <Text>
                                Grenzwahrung und die Prävention von Grenzverletzungen und sexualisierter Gewalt sind wichtige Themen im rdp und auch bei uns auf dem FarbenmEEHr. 
                                Das Präventionsteam „Wellenbrecher“ ist auf FarbenmEEHr für dieses Thema verantwortlich. 
                                Bei Fragen könnt ihr euch an die Wellenbrecher oder das Präventionsteam eures eigenen Verbandes wenden:
                                <TextList>
                                  <ListItem>Wellenbrecher: {mail("praevention@farbenmeehr2020.de")}</ListItem>
                                  <ListItem>VCP Württemberg: {mail("clemens.mohn@wuerttemberg.vcp.de")}</ListItem>
                                  <ListItem>VCP Baden: {mail("ak-aktiv@vcp-baden.de")}</ListItem>
                                  <ListItem>DPSG Freiburg: {mail("judith.baeumle@dpsg-freiburg.de")}</ListItem>
                                  <ListItem>DPSG Rottenburg-Stuttgart: {mail("kindeswohl@dpsg.info")}</ListItem>
                                  <ListItem>PSG Freiburg: {mail("christina@psg-freiburg.de")}</ListItem>
                                  <ListItem>PSG Rottenburg-Stuttgart: {mail("psg@bdkj-drs.de")}</ListItem>
                                  <ListItem>BdP: {mail("praevention@intakt-bawue.de")}</ListItem>
                                </TextList>
                              </Text>
                            </TextContent>
                        </>,
                        en: <>

                        </>
                      })
                      }
                      {fieldVisibilityMap.get("awarenessTraining") &&
                      t({
                        de: <>
                          <TextContent className="hidePrint">
                            <Text component="h2">
                              Prävention
                            </Text>
                            <Text>
                              Pfadfinden – das bedeutet Spaß, Abenteuer, Freunde, Lagerfeuer und für jeden ein
                              bisschen
                              was anderes. Vor allem aber: gemeinsam eine gute Zeit erleben! Damit Pfadfinden für alle
                              eine tolle Erfahrung wird, müssen wir achtsam miteinander umgehen, die eigenen Grenzen
                              wahrnehmen und die der anderen nicht übertreten.
                            </Text>
                            
                            {isType(values, "staff") ?
                              <>
                                <Text>
                                  Grenzwahrung und die Prävention von Grenzverletzungen und sexualisierter Gewalt sind wichtige Themen 
                                  im rdp und auch bei uns auf dem FarbenmEEHr. Die Gruppe „Wellenbrecher“ ist auf dem FarbenmEEHr für 
                                  dieses Thema verantwortlich. Bei Fragen könnt ihr euch an die Wellenbrecher oder das Präventionsteam eures eigenen Verbandes wenden.
                                </Text>
                                <Text>
                                  Für euch bedeutet das konkret, dass ihr eine Schutzschulung besucht, ein erweitertes Führungszeugnis 
                                  bei der für euch zuständigen Stelle eingesehen lassen habt und eine Selbstverpflichtungserklärung 
                                  unterschrieben haben müsst, um am Lager teilnehmen zu können.
                                </Text>
                              </>
                              :<>
                                <Text>
                                  Grenzwahrung und die Prävention von Grenzverletzungen und sexualisierter Gewalt sind wichtige Themen 
                                  im rdp und auch bei uns auf dem FarbenmEEHr. Das Präventionsteam „Wellenbrecher“ ist auf FarbenmEEHr für
                                  dieses Thema verantwortlich. Bei Fragen könnt ihr euch an die Wellenbrecher oder das Präventionsteam eures eigenen Verbandes wenden.
                                </Text>
                                <Text>
                                  Für euch bedeutet das konkret, dass ihr eine Schutzschulung besucht, ein erweitertes Führungszeugnis bei 
                                  der für euch zuständigen Stelle eingesehen lassen habt (gilt NICHT für Leiter*innen des BdP) und eine 
                                  Selbstverpflichtungserklärung unterschrieben haben müsst (gilt NUR für Stammes- und Gruppenleitungen), 
                                  um am Lager teilnehmen zu können. 
                                </Text>
                                <Text>
                                  Die Selbstverpflichtung findet ihr unter dem Bereich „Prävention“ auf der Homepage des Ringelagers (
                                    <a href="https://farbenmeehr2020.de/praevention/" target="_blank" rel="noopener noreferrer">farbenmeehr2020.de/praevention/</a>)
                                </Text>
                              </>
                            }

                            <Text component="h3">
                              Schulung
                            </Text>
                            <Text>
                              Unter Schulung verstehen wir in den einzelnen Verbänden:
                            </Text>
                            <TextList>
                              <ListItem>VCP: "achtsam und aktiv"-Schulung, "alle Achtung"</ListItem>
                              <ListItem>DPSG und PSG: Baustein 2.d oder BDKJ-Schulung</ListItem>
                              <ListItem>BdP: jede Einheit von Intakt auf Kursen (BK bis GK) oder im Stamm</ListItem>
                            </TextList>
                            <Text>
                              Wenn du noch keine Schulung besucht hast, bitten wir Dich dies bis zum FarbenmEEHr
                              nachzuholen. Für weitere Informationen über die Möglichkeiten von Schulungen in Deinem
                              oder einem fremden Verband, melde dich einfach bei den Wellenbrechern, dem
                              Präventionsteam des FarbenmEEHr 2020, oder dem Präventionsteam deines eigenen
                              Verbandes:
                            </Text>
                            <TextList>
                              <ListItem>Wellenbrecher: {mail("praevention@farbenmeehr2020.de")}</ListItem>
                              <ListItem>VCP Württemberg: {mail("clemens.mohn@wuerttemberg.vcp.de")}</ListItem>
                              <ListItem>VCP Baden: {mail("ak-aktiv@vcp-baden.de")}</ListItem>
                              <ListItem>DPSG Freiburg: {mail("judith.baeumle@dpsg-freiburg.de")}</ListItem>
                              <ListItem>DPSG Rottenburg-Stuttgart: {mail("kindeswohl@dpsg.info")}</ListItem>
                              <ListItem>PSG Freiburg: {mail("christina@psg-freiburg.de")}</ListItem>
                              <ListItem>PSG Rottenburg-Stuttgart: {mail("psg@bdkj-drs.de")}</ListItem>
                              <ListItem>BdP: {mail("praevention@intakt-bawue.de")}</ListItem>
                            </TextList>
                          </TextContent>
                          <SelectField
                            label={t({
                              de: 'Schulung zum Thema "Schutz vor sexualisierter Gewalt"',
                              en: 'Awareness training "Protection against sexualised violence"',
                            })}
                            name="awarenessTraining"
                            isRequired
                          >
                            {selectPlaceholder}
                            {Object.entries({
                              alreadyHave: t({
                                de: "Ja, ich habe bereits eine Schulung besucht.",
                                en: "Yes, I have already attended a training course.",
                              }),
                              needTo: t({
                                de: 'Nein, aber ich werde das bis zum Lager nachholen.',
                                en: "No, but I will catch up on that until the camp starts.",
                              }),
                            }).map((value, index) => (
                              <FormSelectOption key={index} value={value[0]} label={value[1]}/>
                            ))}
                          </SelectField>
                        </>,
                        en: <>
                          <TextContent className="hidePrint">
                            <Text component="h2">
                              Safe-From-Harm training
                            </Text>
                            <Text>
                              Scouting – that means fun, adventure, friends, campfires and for everyone of us something a
                              little different. But most importantly: Having a great time together! Making scouting a
                              great
                              experience is everyones responsibility. We have to mindful of each other, know our own
                              boundaries and do not cross the boundaries of others.
                            </Text>
                            <Text>
                              The respect of boundaries and the prevention of violations of the personal boundaries and
                              sexualized violence are important topics in the German Scouting (RDP) and for us at
                              FarbenmEEHr. The group “Wellenbrecher” is responsible for that topic at FarbenmEEHr.
                            </Text>
                            <Text>
                              For us, prevention means among others, that every international staff has a letter of
                              recommendation from their International Commissioner and is part of WAGGGS or WOSM.
                              So please be sure that you have a letter of recommendation. Furthermore, all they have
                              received a training within the scope of the “Safe from Harm” policy of WOSM.
                            </Text>
                            <Text>
                              Completing the training is required for staff.
                            </Text>
                            <Text>
                              If you have selected No below, please take the course “Safe from Harm for Everyone” at {' '}
                              <a href="https://www.scout.org/elearning_sfh1" target="_blank" rel="noopener noreferrer">
                                SfH1: Safe from Harm for Everyone
                              </a> until the beginning of FarbenmEEHr. Moreover, at the
                              camp you get a special prevention workshop from the team of the "Wellenbrecher".
                            </Text>
                            <Text>
                              If you have further questions, you can contact the prevention team at
                              {' '}{mail("praevention@farbenmeehr2020.de")} or the international team at
                              {' '}{mail("international@farbenmeehr2020.de")}.
                            </Text>
                          </TextContent>
                          <SelectField
                            label={t({
                              de: 'Schulung zum Thema "Schutz vor sexualisierter Gewalt"',
                              en: 'Awareness training "Protection against sexualised violence"',
                            })}
                            name="awarenessTraining"
                            isRequired
                          >
                            {selectPlaceholder}
                            {Object.entries({
                              alreadyHave: t({
                                de: "Ja, ich habe bereits eine Schulung besucht.",
                                en: "Yes, I have been trained according to the \"Safe from harm\" policy in the last 5 years",
                              }),
                              needTo: t({
                                de: 'Nein, aber ich werde das bis zum Lager nachholen.',
                                en: "No, I haven’t been trained in the last 5 years.",
                              }),
                            }).map((value, index) => (
                              <FormSelectOption key={index} value={value[0]} label={value[1]}/>
                            ))}
                          </SelectField>
                        </>
                      })}
                      {isType(values, "staff") && <><SelectField
                          label={t({
                            de: "Führungszeugnis",
                            en: "Background check according to my local organization's requirements",
                          })}
                          name="staffBackgroundCheck"
                          helperText={
                            t({
                              de: <>
                                Als Helfer*in benötigst du ein aktuelles erweitertes Führungszeugnis. Ohne gültiges erweitertes Führungszeugnis ist eine Teilnahme am Lager nicht möglich.
                                Bitte beachte dabei, dass ein Führungszeugnis nur maximal 5 Jahre gültig ist. Falls du noch ein
                                Führungszeugnis benötigst, wende dich an den Bereich Wellenbrecher, das Präventionsteam
                                des
                                FarbenmEEHr 2020, oder an das Präventionsteam deines eigenen Verbandes.
                              </>,
                              en: <>
                              </>,
                            })
                          }
                          isRequired
                      >
                        {selectPlaceholder}
                        {Object.entries({
                          alreadyHave: t({
                            de: "Ja, ein erweitertes Führungszeugnis liegt vor.",
                            en: "Yes, a valid non-expired background check is on file.",
                          }),
                          needTo: t({
                            de: "Nein, ich werde mich bis zur Veranstaltung darum kümmern.",
                            en: "No, I will take care of this.",
                          }),
                        }).map((value, index) => (
                          <FormSelectOption key={index} value={value[0]} label={value[1]}/>
                        ))}
                      </SelectField>

                          <BooleanField
                              name="staffFancyAwarenessThingy"
                              isRequired
                              label={t({
                                de: <>Ich habe die {selfDeclarationLink} gelesen, verstanden und bringe sie ausgedruckt
                                  und unterschrieben zum
                                  Lager mit.</>,
                                en: <>I read the {selfDeclarationLink} and agree to be bound by it.</>,
                              })}
                              helperText={
                                t({
                                  de: <>
                                    Die Selbstverpflichtung bezieht sich auf die Prävention von Gewalt, insbesondere sexualisierter Gewalt. 
                                    Du bestätigst hiermit, dass du dich im Rahmen deiner Möglichkeiten dafür einsetzen wirst, dass sexuelle 
                                    Gewalt und Missbrauch auf dem Lager keinen Platz haben und betroffene Personen Schutz und Unterstützung finden.
                                  </>,
                                  en:<>
                                  
                                  </>,
                                })
                              }
                          />
                              </>}
                      {isType(values, "staff") && staffForm(values)}
                        <div className="breakBefore"/>
                        <BooleanField
                            name="agbAgreed"
                            headerLabel={t({
                              de: "Zustimmung zur AGB",
                              en: "Terms and Conditions",
                            })}
                            isRequired
                            label={t({
                              de:
                                <>
                                  Ich stimme den {termsOfServiceLink} zu und bestätige, dass ich einen
                                  zahlungspflichtigen Vertrag nach deutschem Recht abschließe.
                                </>,
                              en:
                                <>
                                  I agree to the {termsOfServiceLink} and acknowledge that I enter into a contract
                                  subject to payment under German law.
                                </>,
                            })}
                        />
                        <BooleanField
                            name="gdprAgreed"
                            headerLabel={t({
                              de: "Zustimmung zur Datenverarbeitung",
                              en: "Terms and Conditions",
                            })}
                            isRequired
                            label={t({
                              de:
                                <>
                                  Ich stimme der Speicherung und Verarbeitung meiner personenbezogenen
                                  Daten
                                  {m(" ", " und der personenbezogenen Daten meines Kindes ")}
                                  zum alleinigen Zweck der Planung und Durchführung der Veranstaltung zu. Ich bin
                                  damit einverstanden, dass ich kontaktiert werde. Falls weitere
                                  Notfallkontakte angegeben wurden, habe ich diese über die
                                  Verarbeitung ihrer Daten informiert und ihre Zustimmung eingeholt.
                                </>,
                              en:
                                <>
                                  I agree that {m("my", "my and my child's")} personal data will be stored and
                                  processed for the sole purpose of organizing the event. I agree to be contacted via
                                  e-mail or phone, if
                                  necessary. Any emergency contacts have consented to the use of their contact
                                  information.
                                </>,
                            })}
                        />
                        <BooleanField
                            name="medicalSheet"
                            headerLabel={t({
                              de: "Gesundheitsbogen",
                              en: "Medical sheet",
                            })}
                            isRequired
                            label={t({
                              de:
                                <>
                                  Ich habe den {medicalSheetLink} ausgedruckt und ausgefüllt und werde ihn
                                  meinem Stamm gefaltet in einem Briefumschlag zukommen lassen.
                                </>,
                              en:
                                <>
                                  I printed and completed the {medicalSheetLink} and will
                                  pass it to my group in a sealed envelope.
                                </>
                            })}
                        />
                        <BooleanField
                            name="pictureAgreement"
                            headerLabel={t({
                              de: "Fotonutzungsformular",
                              en: "Photo usage form",
                            })}
                            isRequired
                            label={t({
                              de:
                                <>
                                  Ich habe das {picturePermissionLink} ausgedruckt und ausgefüllt.
                                </>,
                              en:
                                <>
                                  I printed and completed the {picturePermissionLink}.
                                </>
                            })}
                        />
                    </>}
                    <AuthComponent isLoggedIn={loggedIn} loggedInChange={handleLoggedInChange}/>
                    {(!isValid && (submitCount > 0 || printTouched)) &&
                    <Alert
                        variant="danger"
                        isInline
                        title={t({
                          de: "Das Formular ist unvollständig - bitte prüfe Deine Eingaben.",
                          en: "Please check your input - validation errors occurred.",
                        })}/>}
                    {errorMessage !== "" &&
                    <Alert
                        variant="danger"
                        isInline
                        title={t({
                          de: "Ein Fehler ist aufgetreten. Bitte versuche es erneut, oder kontaktiere it@farbenmeehr2020.de mit der folgenden Fehlernummer, falls der Fehler weiterhin auftritt:",
                          en: "An error occurred. Please retry and contact it@farbenmeehr2020.de with the following error ID, if the error persists:",
                        })}>{errorMessage}</Alert>}
                    {progressMessage !== "" &&
                    <Alert
                        variant="info"
                        isInline
                        title={t({
                          de: "Aktion vor dem Abschicken erforderlich",
                          en: "Action required before submitting",
                        })}>{progressMessage}</Alert>}
                    {success !== "" &&
                    <>
                        <Alert
                            variant="success" isInline
                            title={t({
                              de: "Deine Anmeldung wurde erfolgreich abgesendet. Falls weitere Anmeldungen erfolgen sollen (etwa für Geschwisterkinder), bitte direkt mit der nächsten Anmeldung fortfahren. Die Referenznummer deiner Anmeldung lautet:",
                              en: "Your registration was successfully submitted. If you want to register more participants/family members, please proceed to do so immediately. Your reference number is:",
                            })}>{success}
                            <p/>
                            <p>
                                <Button variant="secondary" onClick={event => window.location.reload()}>
                                  {t({de: "Weitere Anmeldung", en: "Proceed with next registration"})}
                                </Button>
                                &nbsp;&nbsp;&nbsp;
                                {/*
                                  <Button variant="secondary" onClick={() => {
                                    firebase.auth().signOut()
                                    window.location.reload()
                                  }}>Logout</Button>
                                */}
                            </p>
                        </Alert>
                    </>
                    }
                    <PageSection variant={PageSectionVariants.light} className="hideScreen" style={{paddingTop: "50px"}}>
                      <Text component="h2">
                        {t({
                          de: m(
                            "Unterschrift des Teilnehmers",
                            "Unterschrift beider Erziehungsberechtigten"),
                          en: m(
                            "Participant's signature",
                            "Both legal guardian's signatures")
                        })}
                      </Text>
                      {m(<img src={signature} alt="Signature line"/>, <img src={twoSignatures}
                                                                           alt="Two signature lines"/>)}
                      {m(null, <Text>
                        {t({
                          de: <>Bei alleinigem Sorgerecht ist nur eine Unterschrift erforderlich.</>,
                          en: <>If there is only one legal guardian, only one signature is required.</>,
                        })}
                      </Text>)}
                      <Bullseye style={{paddingTop: "25px"}}>
                        <Text className="printBox">
                          {t({
                            de: <>
                              Bitte keine handschriftlichen Änderungen auf dem ausgedruckten Formular vornehmen -
                              Der Ausdruck dient lediglich als Bestätigung der digital übermittelten Anmeldung.
                            </>,
                            en: <>
                              Please do not add hand-written notes to this form.
                              The printout only serves as paper trail for
                              the data that has been submitted digitally.
                            </>
                          })}
                        </Text>
                      </Bullseye>
                    </PageSection>
                    {success === "" &&
                    <PageSection variant={PageSectionVariants.light} className="hidePrint">
                        <TextContent>
                            <Text>
                              {t({
                                de:
                                  <>
                                    <b>Vor</b> dem Abschicken des Formulars bitte alle Angaben prüfen und
                                    das Formular ausdrucken, sofern dies vom Stamm gewünscht ist.
                                    Das ausgedruckte Formular dann bitte
                                    zusammen mit dem Gesundheitsbogen und dem Fotonutzungsformular
                                    dem Stamm unterschrieben in Papierform zukommen lassen.
                                  </>,
                                en:
                                  <>
                                    <b>Before</b> submitting the form, please check all details and print the form.
                                    Please hand the printed form to your group's leaders,
                                    alongside the health questionnaire and the photo usage form.
                                  </>,
                              })}
                            </Text>
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
                            <Text>
                              {t({
                                de:
                                  <b>
                                    Nach dem Verifizieren der Mailadresse
                                    muss noch abschließend auf "Abschicken" geklickt werden! Nach erfolgreicher
                                    Anmeldung wird auf dieser Seite ein Bestätigungscode angezeigt und eine weitere
                                    Mail verschickt, in der die Anmeldung bestätigt wird.
                                  </b>,
                                en:
                                  <b>
                                    The registration is successful only if you get a confirmation number
                                    on this page. After verifying the email address, you still have to submit the form.
                                    Once the form has been submitted, you will get another mail to confirm your
                                    registration.
                                  </b>,
                              })}
                            </Text>
                            <ActionGroup>
                                <Button variant={printTouched && isValid ? "secondary" : "primary"} onClick={() => {
                                  setPrintTouched(true);
                                  Object.keys(values).forEach((value) => {
                                    setFieldTouched(value as (keyof IParticipantSignup), true);
                                  });
                                  validateForm().then(value => {
                                    if (Object.keys(value).length === 0) {
                                      window.print();
                                    }
                                  });
                                }} isDisabled={isSubmitting}>{t({
                                  de: <>Ausdrucken</>,
                                  en: <>Print form</>,
                                })}</Button>
                                <Button variant="primary" onClick={submitForm} isDisabled={!loggedIn}>{t({
                                  de: <>Abschicken</>,
                                  en: <>Submit registration</>,
                                })}</Button>
                                <Button variant="tertiary" isDisabled={isSubmitting} onClick={() => {
                                  setStoredValues(defaultValues);
                                  window.location.reload() // TODO
                                }}>{t({
                                  de: <>Formular zurücksetzen</>,
                                  en: <>Reset form</>,
                                })}</Button>
                            </ActionGroup>
                        </TextContent>
                    </PageSection>}
                  </Form>
                )
              }}/>
          </TextContent>
        </PageSection>
      </>)

    return <>
      <>
        {groupData !== undefined ? signupDetail :
          <>
            {groupErrorMessage !== "" ? <Alert
                variant="danger"
                isInline
                title={t({
                  de: "Ein Fehler ist aufgetreten. Bitte versuche es erneut, oder kontaktiere it@farbenmeehr2020.de mit der folgenden Fehlernummer, falls der Fehler weiterhin auftritt:",
                  en: "An error occurred. Please retry and contact it@farbenmeehr2020.de with the following error ID, if the error persists:",
                })}>{groupErrorMessage}</Alert> :
              <>
                <Bullseye>
                  {t({
                    de: "Daten werden geladen...",
                    en: "Loading data...",
                  })}
                </Bullseye>
                <Bullseye style={{minHeight: "200px"}}>
                  <Spinner size="xl"/>
                </Bullseye>
              </>
            }
          </>
        }
      </>
    </>;
  }
;
