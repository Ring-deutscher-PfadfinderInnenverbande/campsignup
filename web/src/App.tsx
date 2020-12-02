import React from 'react';
import './App.css';
import '@patternfly/react-core/dist/styles/base.css';
import GroupSignupPage from "./SignupPage/GroupSignupPage";
import LanguageChooser from "./Utils/LanguageChooser";
import {Page, PageSection, Bullseye, PageSectionVariants} from "@patternfly/react-core";
import firebase from "firebase";
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import {ParticipantSignupPage} from "./SignupPage/ParticipantSignupPage";
import {ManageGroupPage} from "./SignupPage/ManageGroupPage";
import * as Sentry from '@sentry/browser';
import eventLogo from './SignupPage/logo.png';

const firebaseEnvironments = {
  "production": {
    apiKey: "AIzaSyB09164R_cSfdbPZOk6JBtkgCLMe8Kovn0",
    authDomain: "farbenmeehr2020.firebaseapp.com",
    databaseURL: "https://farbenmeehr2020.firebaseio.com",
    projectId: "farbenmeehr2020",
    storageBucket: "farbenmeehr2020.appspot.com",
    messagingSenderId: "684022690443",
    appId: "1:684022690443:web:f5c6fcaee2d37d9b689a8e",
    measurementId: "G-G4S0MC02FD"
  },
  "development": {
    apiKey: "AIzaSyAV8RZ8Occheq5Dk5hJeNHpMxzFJSX0nlg",
    authDomain: "farbenmeehr2020-dev.firebaseapp.com",
    databaseURL: "https://farbenmeehr2020-dev.firebaseio.com",
    projectId: "farbenmeehr2020-dev",
    storageBucket: "",
    messagingSenderId: "966726960161",
    appId: "1:966726960161:web:5ab05d8099952b7cb38f60",
    measurementId: "G-DCG7JTB0NP"
  },
  "test": {
    apiKey: "AIzaSyAV8RZ8Occheq5Dk5hJeNHpMxzFJSX0nlg",
    authDomain: "farbenmeehr2020-dev.firebaseapp.com",
    databaseURL: "https://farbenmeehr2020-dev.firebaseio.com",
    projectId: "farbenmeehr2020-dev",
    storageBucket: "",
    messagingSenderId: "966726960161",
    appId: "1:966726960161:web:5ab05d8099952b7cb38f60",
    measurementId: "G-DCG7JTB0NP"
  },
};

const firebaseConfig = firebaseEnvironments[process.env.NODE_ENV];

const app = firebase.initializeApp(firebaseConfig);
app.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);

const App: React.FC = () => {
  if (window.navigator.userAgent.indexOf("Trident/") !== -1) {
    return (
      <div>
        Internet Explorer is not supported - please use a modern browser like {' '}
        <a href="https://www.google.com/chrome/" target="_blank" rel="noopener noreferrer">
          Google Chrome
        </a>, Firefox or Microsoft Edge.
      </div>
    )
  }

  if (firebase.auth().isSignInWithEmailLink(window.location.href)) {
    var email = window.localStorage.getItem('emailForSignIn');

    if (!email) {
        alert("Bitte den Bestätigungslink im selben Browser auf dem selben Gerät öffnen, auf dem die Anmeldung stattfindet.")
    } else {
      firebase.auth().signInWithEmailLink(email, window.location.href).then(value => {
        window.localStorage.removeItem('emailForSignIn');
        alert("Login erfolgreich - die Anmeldung kann nun im anderen Tab fortgesetzt werden.")
      }).catch(reason => {
        alert("Ein Fehler beim Login per Link ist aufgetreten. Bitte rdp@leoluk.de kontaktieren und diese Nummer angeben: " + Sentry.captureException(reason))
      })
    }
  }

  return (
    <Page>
      <LanguageChooser>
      <PageSection variant={PageSectionVariants.light}>
        <Bullseye>
          <img width="300px" src={eventLogo} alt="Logo der Veranstaltung"/>
        </Bullseye>
      </PageSection>
        <BrowserRouter>
          <Switch>
            <Route
              path="/registration/participants/:groupID"
              component={ParticipantSignupPage}
            />
            <Route
              path="/manage/group"
              component={ManageGroupPage}
              exact
            />
            <Route
              path="/loginViaLink"
              render={() => <>Dieses Fenster kann geschlossen werden.</>}
              exact
            />
            <Route
              path="/"
              component={GroupSignupPage}
              exact
            />
            <Route render={() => <>404 Page Not Found</>}/>
          </Switch>
        </BrowserRouter>
      </LanguageChooser>
    </Page>
  );
};

export default App;
