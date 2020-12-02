import React from "react";
import {useTranslation} from "../Utils/i18n";
import {TextAreaField, TextField} from "./Fields";

export interface IGuardianContact {
  fullName: string,
  address: string,
  phone: string,
  email: string,
  misc: string,
}

export interface IOwnContact {
  fullName: string,
  address: string,
  phone: string,
  email: string,
}

export interface IEmergencyContact {
  fullName: string,
  role: string,
  address: string,
  phone: string,
  email: string,
  misc: string,
}

export const GuardianContactForm: React.FC<{
  name: string,
}> = ({name}) => {
  const t = useTranslation();

  return (
    <>
      <TextField
        isRequired
        label={t({
          de: "Vor- und Nachname",
          en: "First and last name",
        })}
        name={`${name}.fullName`}
      />
      <TextAreaField
        isRequired
        rows={5}
        label={t({
          de: "Anschrift",
          en: "Postal Address",
        })}
        name={`${name}.address`}
      />
      <TextField
        isRequired
        label={t({
          de: "Telefonnummer (Mobilnummer bevorzugt)",
          en: "Phone number (mobile phone number preferred)",
        })}
        name={`${name}.phone`}
      />
      <TextField
        isRequired
        label={t({
          de: "E-Mail-Adresse",
          en: "Email address",
        })}
        name={`${name}.email`}
      />
      <TextAreaField
        rows={3}
        label={t({
          de: "Weitere Anmerkungen zur Erreichbarkeit",
          en: "Other remarks on reachability",
        })}
        name={`${name}.misc`}
      />
    </>
  );
};

export const EmergencyContactForm: React.FC<{
  name: string,
}> = ({name}) => {
  const t = useTranslation();

  return (
    <>
      <TextField
        isRequired
        label={t({
          de: "Vor- und Nachname",
          en: "First and last name",
        })}
        name={`${name}.fullName`}
      />
      <TextField
        isRequired
        label={t({
          de: "Beziehung (Eltern, Nachbar, Großmutter...)",
          en: "Relationship (parents, neighbor, grandmother...)",
        })}
        name={`${name}.role`}
      />
      <TextAreaField
        rows={5}
        label={t({
          de: "Anschrift",
          en: "Postal Address",
        })}
        name={`${name}.address`}
      />
      <TextField
        isRequired
        label={t({
          de: "Telefonnummer (Mobilnummer bevorzugt)",
          en: "Phone number (mobile phone number preferred)",
        })}
        name={`${name}.phone`}
      />
      <TextField
        isRequired
        label={t({
          de: "E-Mail-Adresse",
          en: "Email address",
        })}
        name={`${name}.email`}
      />
      <TextAreaField
        rows={3}
        label={t({
          de: "Weitere Anmerkungen zur Erreichbarkeit",
          en: "Other remarks on reachability",
        })}
        name={`${name}.misc`}
      />
    </>
  );
};

export const OwnContactForm: React.FC<{
  name: string,
}> = ({name}) => {
  const t = useTranslation();

  return (
    <>
      <TextAreaField
        isRequired
        rows={5}
        label={t({
          de: "Anschrift",
          en: "Postal Address",
        })}
        name={`${name}.address`}
      />
      <TextField
        isRequired
        label={t({
          de: "Mobiltelefon",
          en: "Mobile phone",
        })}
        name={`${name}.phone`}
        placeholder={"+49 1520 12345678"}
      />
      <TextField
        isRequired
        label={t({
          de: "E-Mail-Adresse",
          en: "Email address",
        })}
        name={`${name}.email`}
      />
    </>
  );
};
