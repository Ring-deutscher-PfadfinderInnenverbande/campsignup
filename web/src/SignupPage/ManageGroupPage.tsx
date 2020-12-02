import React from "react";
import {
  Alert,
  Bullseye,
  Card,
  CardBody,
  ClipboardCopy,
  PageSection,
  PageSectionVariants,
  Text,
  TextContent,
  TextVariants
} from "@patternfly/react-core";
import {headerCol, Table, TableBody, TableHeader} from '@patternfly/react-table';
import eventLogo from './logo.png';
import {useTranslation} from "../Utils/i18n";
import firebase from "firebase";
import {VerifiedNumberInput} from "./VerifiedNumberInput";
import {IGroupSignup} from "./GroupSignupPage";
import * as Sentry from "@sentry/browser";
import {foodOptions, IParticipantDocument, participantTypeMap} from "./Common";

export const GroupCopyLinks: React.FC<{ groupID: string }> = ({groupID}) => {
  const t = useTranslation();
  const signupLink = `https://${window.location.hostname}/registration/participants/${groupID}`
  return (
    <>
      <Text component="h2">
        {t({
          de: <>Anmeldelinks für Teilnehmer</>,
          en: <>Registration links for participants</>,
        })}
      </Text>
      <Text>
        {t({
          de: <>Eure Teilnehmer können diesen Link nutzen, um sich anzumelden:</>,
          en: <>Your particpants can use this link in order to register:</>,
        })}
      </Text>
      <ClipboardCopy
        isReadOnly
        hoverTip={t({de: "Kopieren", en: "Copy"})}
        clickTip={t({de: "In die Zwischenablage kopiert", en: "Copied to clipboard"})}
        variant="inline">
        {signupLink}
      </ClipboardCopy>
      <p/>
      <Text>
        {t({
          de: <>Leiter*innen registrieren sich ebenfalls dort - <a href={signupLink}>hier klicken</a>, um direkt zu
            eurer Anmeldeseite zu gelangen.</>,
          en: <>Leaders also use this page to register themselves - <a href={signupLink}>click here</a> to open your
            group's registration page.</>,
        })}
      </Text>
    </>
  );
}

export const ManageGroupPage: React.FC = () => {
  const t = useTranslation();
  const db = firebase.firestore();

  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [groupData, setGroupData] = React.useState<IGroupSignup>();
  const [participantList, setParticipantList] = React.useState<IParticipantDocument[]>();
  const [groupID, setGroupID] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  const groupRef = db.collection("groups");

  React.useEffect(() => {
    return firebase.auth().onAuthStateChanged(async () => {
      const user = firebase.auth().currentUser;

      if (user && user.phoneNumber && user.email) {
        setPhoneNumber(user.phoneNumber)
      }

      if (user && user.uid) {
        // Get group data
        const q = groupRef.where("meta.createdBy", "==", user.uid);

        try {
          const r = await q.limit(1).get()
          if (!r.empty) {
            const doc = r.docs[0]

            setGroupData(doc.data().values as IGroupSignup)
            setGroupID(doc.id);
            const pq = await doc.ref.collection("registrations").get()

            setParticipantList(pq.docs.map(value => (value.data() as IParticipantDocument)))

          } else {
            setGroupData(undefined)
            setParticipantList(undefined)
          }
        } catch (e) {
          console.error(e);
          setErrorMessage(Sentry.captureException(e));
          setGroupData(undefined)
          setParticipantList(undefined)
        }
      } else {
        setGroupData(undefined)
        setGroupID("")
        setParticipantList(undefined)
      }
    });
  }, []);

  return (
    <>
      <PageSection variant={PageSectionVariants.light}>
        <Bullseye>
          <img width="300px" src={eventLogo} alt="Logo der Veranstaltung"/>
        </Bullseye>
      </PageSection>
      <PageSection variant={PageSectionVariants.light}>
        <TextContent>
          <Bullseye>
            <Text component={TextVariants.h1}>
              {t({
                de: <>Stamm verwalten</>,
                en: <>Manage group</>,
              })}
            </Text>
          </Bullseye>
          <Bullseye>
            <Text component={TextVariants.h2}>
              {groupData && groupData.name}
            </Text>
          </Bullseye>
          {errorMessage !== "" &&
          <Alert
              variant="danger"
              isInline
              title={t({
                de: "Ein Fehler ist aufgetreten. Bitte versuche es erneut, oder kontaktiere rdp@leoluk.de mit der folgenden Fehlernummer, falls der Fehler weiterhin auftritt:",
                en: "An error occurred. Please retry and contact rdp@leoluk.de with the following error ID, if the error persists:",
              })}>{errorMessage}</Alert>}
          <Text component="h2">
            {t({
              de: <>Login und Account</>,
              en: <>Manage account</>,
            })}
          </Text>
          {t({
            de:
              <>
                <Text>
                  Auf dieser Seite kannst Du Deinen Stamm verwalten. Zur Anmeldung nutzt Du die
                  Handynummer, die während der Stammesanmeldung bestätigt wurde.
                </Text>
              </>,
            en:
              <>
                <Text>
                  On this page you can manage your group. For logging in, you use the
                  mobile phone number you confirmed during the group registration.
                </Text>
              </>
          })}
          {t({
            de:
              <>
                <Text>
                  Du hast über die Stammverwaltung Zugriff auf vertrauliche persönliche Daten
                  Deiner Mitglieder. Falls es sich um einen gemeinsam genutzten Computer handelt,
                  solltest Du dich abmelden, sobald du fertig bist.
                </Text>
              </>,
            en:
              <>
                <Text>
                  This tool allows you to access your group member's confidential personal data.
                  If this is a shared computer, please remember to log out of your session
                  once you're done.
                </Text>
              </>
          })}
          <Card>
            {/*
            <CardHeader>
              <h2>
                {t({de: "Anmeldung mit Deiner Telefonnummer", en: "Log in using you phone number"})}
              </h2>
            </CardHeader>
*/}
            <CardBody>
              <VerifiedNumberInput
                isValid={true}
                loginForm={true}
                data={phoneNumber}
                onChange={(e) => setPhoneNumber(e)}/>
            </CardBody>
          </Card>
          {groupData && <GroupCopyLinks groupID={groupID}/>}
          <Text component="h2">
            {t({
              de: <>Liste der Anmeldungen</>,
              en: <>List of Registrations</>,
            })}
          </Text>
        </TextContent>
        <Table actions={[
          /* {
            title: 'Ersatzlos stornieren',
            onClick: (event, rowId, rowData, extra) => {
            }
          },  {
            title: 'Anmeldung bearbeiten',
            onClick: (event, rowId, rowData, extra) => {
            }
          }, {
            title: 'Teilnehmer ersetzen',
            onClick: (event, rowId, rowData, extra) => {
            }
          } */]} cells={[
          {title: t({de: 'Name des Teilnehmers', en: "Participant's name"}), cellTransforms: [headerCol()]},
          {title: t({de: 'Kategorie', en: "Category"})},
          {title: t({de: 'Essenswahl', en: "Food choice"})},
          {title: t({de: 'Beitrag (€)', en: "Rate (€)"})},
          // {title: t({de: 'Altersstufe', en: 'Rank'})},
        ]} rows={participantList ? participantList.map(value => (
          {
            cells: [
              value.values.fullName,
              value.values.type !== "" && t(participantTypeMap[value.values.type]),
              value.values.foodOptions !== "" && t(foodOptions[value.values.foodOptions]),
              `${value.billing.effectivePrice || t({de: "Tagesgast", en: "Day guest"})}`
            ]
          })) : []}>
          <TableHeader/>
          <TableBody/>
        </Table>
        <PageSection variant={PageSectionVariants.light}>
          <Alert variant="info" isInline title={t({
            de: "Was, wenn eine Anmeldung in der Liste fehlt?",
            en: "What if someone's missing in this list?",
          })}>
            {t({
              de:
                <>
                  Da uns viele Fragen dazu erreicht haben: es sind nur die Teilnehmenden angemeldet, die in der Liste stehen.
                  Neue Anmeldungen erscheinen sofort in der Liste, es gibt keine Verzögerung - <b>wer fehlt, ist nicht
                  angemeldet</b>. In einigen Fällen wurde zwar die Anmeldung ausgedruckt, aber dann entweder
                  nicht auf Abschicken geklickt, oder nur die E-Mail-Adresse bestätigt ohne danach die Anmeldung abschließend abzusenden.
                  Falls die schriftliche Anmeldung vorliegt, können eingeloggte Stammesleiter*innen die Teilnehmenden selber anmelden.
                  Es wird dann eine E-Mail-Bestätigung an die eingetragene E-Mail-Adresse verschickt, wie bei einer normalen Anmeldung.
                </>,
              en:
                <>
                  <b>Participants missing from this list are not registered</b>. There is no delay, a successful registration
                  appears immediately. In some cases, participants printed the form but either forgot to submit it, or
                  only confirmed their e-mail address without submitting the form. As long as you are logged in, you
                  can do the registration for someone else. They will get an email confirmation just as if they had registered on their own.
                </>,
            })}
          </Alert>
          <Alert variant="info" isInline title={t({
            de: "Was, wenn Teilnehmende keine E-Mail-Bestätigung erhalten haben?",
            en: "What if participants did not get an email confirmation?",
          })}>
            {t({
              de:
                <>
                  Teilnehmende sind erfolgreich angemeldet, wenn sie in der obigen Liste auftauchen, auch dann, wenn
                  sie keine E-Mail-Bestätigung erhalten haben. Die Bestätigungsmails landen gelegentlich in Spam-Filtern,
                  insb. bei Outlook/Hotmail.
                </>,
              en:
                <>
                  Participants are successfully registered if they're listed above, even if they did not get a
                  confirmation mails. Confirmation mails are sometimes classified as spam, especially with Outlook/Hotmail.
                </>,
            })}
          </Alert>
        </PageSection>
      </PageSection>
    </>)
};
