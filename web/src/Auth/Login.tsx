import React from 'react'
import {TextField, PasswordField} from "../SignupPage/Fields"
import {useTranslation} from "../Utils/i18n";
import {Formik} from "formik"
import axios from 'axios'
import {
    Form,
    Button,
  } from '@patternfly/react-core';

export default function Login(props: any) {
    const t = useTranslation();

    const apiEndpoint: String = process.env.NODE_ENV === "development" ? 'http://localhost:8000/api/v1' : 'https://backend.anmeldung-test.farbenmeehr2020.de/api/v1';

    interface ILogin{
        emailAddress: string,
        password: string,
    }

    const initialValues: ILogin = {
        emailAddress: "",
        password: "",
    }

    function validateEmail(value: string) {
        let error;
        if (!value) {
            error = t({
                de: "Diese Angabe ist erforderlich.",
                en: "This field is required."
            });
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
            error = t({
                de: "Ungültige Email-Adresse.",
                en: "Invalid email address."
            });
        }
        return error;
    }

    let errors: string = "";

    return (
        <Formik<ILogin>
              initialValues= {initialValues}
              onSubmit={async (values: ILogin) => {
                errors = ""  
                  axios.post(apiEndpoint + "/user/login", {
                      "username": values.emailAddress,
                      "password": values.password
                  }).then((res) => {
                      localStorage.setItem("token", JSON.stringify(res.data.access));
                      props.logInChange();
                  })
                  .catch((err) => {
                      errors = err;
                  })
              }}
              render={({submitForm}) => {

            return (
                <Form>
                    <TextField
                        label={t({
                        de: "Email-Adresse",
                        en: "Email-address",
                        })}
                        isRequired
                        name="emailAddress"
                        validate={validateEmail}
                    />
                    <PasswordField
                        label={t({
                            de: "Passwort",
                            en: "Password"
                        })}
                        isRequired
                        name="password"
                    />
                    <div style={{color: "red"}}>{errors}</div>
                    <Button variant="primary" onClick={submitForm}>{t({
                        de: <>
                        Login
                        </>,
                        en: <>Login</>,
                    })}</Button>
                </Form>
            )
        }}/>
    )
}