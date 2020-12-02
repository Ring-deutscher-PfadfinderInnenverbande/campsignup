import {Checkbox, FormGroup, FormSelect, Text, TextArea, TextInput} from "@patternfly/react-core";
import React from "react";
import {useField, useFormikContext} from "formik";
import {useTranslation} from "../Utils/i18n";

interface BaseField {
  label: React.ReactNode,
  name: string,
  helperText?: React.ReactNode,
  isRequired?: boolean,
  isDisabled?: boolean,
  validate?: (value: any) => string | void,
}

interface TextField extends BaseField {
  placeholder?: string,
  onChange?: (value: string, event: React.FormEvent<HTMLInputElement>) => void,
}

export const TextField: React.FC<TextField> = (props) => {
  const t = useTranslation();

  const [field, meta] = useField<string | any>({
    name: props.name,
    validate: props.validate || (
      (value: string) => ((value !== undefined && value !== null && value.trim() === "" && props.isRequired) ? t({
        de: `Diese Angabe ist erforderlich.`,
        en: "This field is required."
      }) : undefined))
  });

  return (
    <FormGroup
      type="text"
      label={props.label}
      fieldId={props.name}
      helperTextInvalid={(meta.touched && meta.error) ? meta.error : undefined}
      isValid={!((meta.touched && meta.error))}
      isRequired={props.isRequired}>
      <TextInput
        id={props.name}
        isRequired
        type="text"
        placeholder={props.placeholder}
        value={field.value}
        isValid={!((meta.touched && meta.error))}
        onChange={(value, event) => {
          props.onChange && props.onChange(value, event);
          field.onChange(event)
        }}
        onBlur={field.onBlur}
        isDisabled={props.isDisabled}
      />
      {props.helperText && <Text component="small">{props.helperText}</Text>}
    </FormGroup>
  )
};

interface PasswordField extends BaseField {
  placeholder?: string,
  onChange?: (value: string, event: React.FormEvent<HTMLInputElement>) => void,
}

export const PasswordField: React.FC<PasswordField> = (props) => {
  const t = useTranslation();

  const [field, meta] = useField<string | any>({
    name: props.name,
    validate: props.validate || (
      (value: string) => ((value !== undefined && value !== null && value.trim() === "" && props.isRequired) ? t({
        de: `Diese Angabe ist erforderlich.`,
        en: "This field is required."
      }) : undefined))
  });

  return (
    <FormGroup
      type="password"
      label={props.label}
      fieldId={props.name}
      helperTextInvalid={(meta.touched && meta.error) ? meta.error : undefined}
      isValid={!((meta.touched && meta.error))}
      isRequired={props.isRequired}>
      <TextInput
        id={props.name}
        isRequired
        type="password"
        placeholder={props.placeholder}
        value={field.value}
        isValid={!((meta.touched && meta.error))}
        onChange={(value, event) => {
          props.onChange && props.onChange(value, event);
          field.onChange(event)
        }}
        onBlur={field.onBlur}
        isDisabled={props.isDisabled}
      />
      {props.helperText && <Text component="small">{props.helperText}</Text>}
    </FormGroup>
  )
};

interface TextAreaField extends BaseField {
  placeholder?: string,
  rows?: number,
  onChange?: (value: string, event: React.ChangeEvent<HTMLTextAreaElement>) => void,
}

export const TextAreaField: React.FC<TextAreaField> = (props) => {
  const t = useTranslation();

  const [field, meta] = useField<string | any>({
    name: props.name,
    validate: props.validate || (
      (value: string) => ((value !== undefined && value !== null  && value.trim() === "" && props.isRequired) ? t({
        de: `Diese Angabe ist erforderlich.`,
        en: "This field is required."
      }) : undefined))
  });

  return (
    <FormGroup
      label={props.label}
      fieldId={props.name}
      helperTextInvalid={(meta.touched && meta.error) ? meta.error : undefined}
      isValid={!((meta.touched && meta.error))}
      isRequired={props.isRequired}>
      <TextArea
        isRequired
        id={props.name}
        placeholder={props.placeholder}
        rows={props.rows}
        value={field.value}
        isValid={!((meta.touched && meta.error))}
        onChange={(value, event) => {
          props.onChange && props.onChange(value, event);
          field.onChange(event)
        }}
        onBlur={field.onBlur}
      />
      {props.helperText && <Text component="small">{props.helperText}</Text>}
    </FormGroup>
  )
};

interface BooleanField extends BaseField {
  headerLabel?: string,
  onChange?: (checked: boolean, event: React.FormEvent<HTMLInputElement>) => void,
}

export const BooleanField: React.FC<BooleanField> = (props) => {
  const t = useTranslation();

  const [field, meta] = useField<boolean | any>({
    name: props.name,
    validate: props.validate || (
      (value: boolean) => ((value !== undefined && value !== null  && !value && props.isRequired) ? t({
        de: `Die Zustimmung ist erforderlich.`,
        en: "Your agreement is required."
      }) : undefined))
  });

  const form = useFormikContext<{ [key: string]: boolean }>();

  return (
    <FormGroup
      type="checkbox"
      fieldId={props.name}
      helperTextInvalid={(meta.touched && meta.error) ? meta.error : undefined}
      isValid={!((meta.touched && meta.error))}
      label={props.headerLabel}
      isRequired={props.isRequired}>
      <Checkbox
        label={props.label}
        name={props.name}
        id={props.name}
        isChecked={field.value}
        onChange={(checked, event) => {
          props.onChange && props.onChange(checked, event);
          form.setFieldValue(props.name, checked);
        }}
        onBlur={field.onBlur}
        isDisabled={props.isDisabled}
      />
      {props.helperText && <Text component="small">{props.helperText}</Text>}
    </FormGroup>
  )
};

interface SelectField extends BaseField {
  children: React.ReactNode,
  onChange?: (value: string, event: React.FormEvent<HTMLSelectElement>) => void,
}

export const SelectField: React.FC<SelectField> = (props) => {
  const t = useTranslation();

  const [field, meta] = useField<string | any>({
    name: props.name,
    validate: props.validate || (
      (value: string) => ((value !== undefined && value !== null  && value/*.trim()*/ === "" && props.isRequired) ? t({
        de: `Diese Angabe ist erforderlich.`,
        en: "This field is required."
      }) : undefined))
  });

  return (
    <FormGroup
      label={props.label}
      fieldId={props.name}
      helperTextInvalid={(meta.touched && meta.error) ? meta.error : undefined}
      isValid={!((meta.touched && meta.error))}
      isRequired={props.isRequired}>
      <FormSelect
        id={props.name}
        isDisabled={props.isDisabled}
        value={field.value}
        onChange={(value, event) => {
          props.onChange && props.onChange(value, event);
          field.onChange(event)
        }}
        isValid={!((meta.touched && meta.error))}
        onBlur={field.onBlur}
      >
        {props.children}
      </FormSelect>
      {props.helperText && <Text component="small">{props.helperText}</Text>}
    </FormGroup>
  )
};

interface MultiChoiceField extends BaseField {
  onChange?: (value: string, event: React.FormEvent<HTMLSelectElement>) => void,
  choices: {
    key: string,
    text: string,
  }[]
}

export const MultiChoiceField: React.FC<MultiChoiceField> = (props) => {
  const t = useTranslation();

  const [field, meta] = useField<string[] | any>({
    name: props.name,
    validate: props.validate || (
      (value: string[]) => ((!value || value.length) === 0 && props.isRequired) ? t({
        de: `Es muss mindestens ein Eintrag ausgewählt sein.`,
        en: "Please select at least one item."
      }) : undefined),
  });

  const form = useFormikContext<{ [key: string]: string[] }>();

  if (!field.value) {
    field.value = []
  }

  return (
    <FormGroup
      label={props.label}
      fieldId={props.name}
      helperTextInvalid={(meta.touched && meta.error) ? meta.error : undefined}
      isValid={!((meta.touched && meta.error))}
      isRequired={props.isRequired}>
      {props.helperText && <Text component="small">{props.helperText}</Text>}
      <div/>
      {props.choices.map((value, index) => (
        <Checkbox
          label={value.text}
          name={props.name + value.key}
          id={props.name + value.key}
          isChecked={field.value && field.value.includes(value.key)}
          onChange={(checked, event) => {
            if (checked) {
              form.setFieldValue(props.name, [...field.value, value.key])
            } else {
              form.setFieldValue(props.name, field.value.filter((x: string) => (x !== value.key)))
            }
          }}
          onBlur={field.onBlur}
          isDisabled={props.isDisabled}
        />
      ))}
    </FormGroup>
  )
};

