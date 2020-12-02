import React from "react";
import {Button, FormGroup, InputGroup, InputGroupText, TextInput} from "@patternfly/react-core";
import {useTranslation, TranslationFunction} from "../Utils/i18n";

type PriceAdjustments = { [s: string]: number };

interface IPriceAdjustmentForm {
  data: PriceAdjustments,
  onChange: (data: PriceAdjustments) => void,
}

export const GetTranslatedPricingClasses: (t: TranslationFunction) => {
  price: number,
  description: string,
  id: string,
  adjustable: boolean,
  enabled: boolean,
  earlyDeparture?: boolean,
}[] = (t) => {
  return [
    {
      id: 'staff',
      price: 120,
      adjustable: true,
      enabled: true,
      description: t({de: 'Helfende', en: 'Staff'})
    },
    {
      id: 'free',
      price: 0,
      adjustable: false,
      enabled: false,
      description: t({de: 'Kostenfreie Teilnahme', en: 'Free'})
    },
    {
      id: 'normal-long-early',
      price: 205,
      adjustable: true,
      enabled: false,
      description: t({
        de: 'Normalbeitrag bei Teilnahme vom 02. bis 12.08. (Frühbucher)',
        en: 'Normal fee for participation from 02. to 12.08. (early bird)'
      })
    },
    {
      id: 'normal-long-full',
      price: 240,
      adjustable: true,
      enabled: true,
      description: t({
        de: 'Normalbeitrag bei Teilnahme vom 02. bis 12.08. (Normalpreis)',
        en: 'Normal fee for participation from 02. to 12.08. (normal price)',
      }),
    },
    {
      id: 'normal-short-early',
      price: 150,
      adjustable: true,
      enabled: false,
      earlyDeparture: true,
      description: t({
        de: 'Normalbeitrag bei Teilnahme von 02. bis 08.08. (Frühbucher)',
        en: 'Normal fee for participation from 02. to 08.08. (early bird)',
      })
    },
    {
      id: 'normal-short-full',
      price: 170,
      adjustable: true,
      enabled: true,
      earlyDeparture: true,
      description: t({
        de: 'Normalbeitrag bei Teilnahme von 02. bis 08.08. (Normalpreis)',
        en: 'Normal fee for participation from 02. to 08.08. (early bird)',
      })
    },
    {
      id: 'family-early',
      price: 150,
      adjustable: true,
      enabled: false,
      description: t({
        de: 'Geschwister-/Familienbeitrag ab der 2. Person von 02. bis 12.08. (Frühbucher)',
        en: 'Siblings/family fee from the 2nd person from 02. to 12.08. (early bird)',
      })
    },
    {
      id: 'family-full',
      price: 170,
      adjustable: true,
      enabled: true,
      description: t({
        de: 'Geschwister-/Familienbeitrag ab der 2. Person von 02. bis 12.08. (Normalpreis)',
        en: 'Siblings/family fee from the 2nd person from 02. to 12.08. (normal price)',
      })
    },
    {
      id: 'social',
      price: 100,
      adjustable: true,
      enabled: true,
      description: t({
        de: 'Sozialbeitrag',
        en: 'Reduced social fee',
      })
    },
    {
      id: 'small-child',
      price: 0,
      adjustable: true,
      enabled: true,
      description: t({
        de: 'Kinder unter sechs Jahren',
        en: 'Children under the age of six',
      })
    },
    // Note: the value on the participant registration form is not taken from here
    {
      id: 'day',
      price: 35,
      adjustable: false,
      enabled: false,
      description: t({
        de: 'Tages-Teilnehmende (pro Übernachtung)',
        en: 'Day participants (per night)',
      })
    },
    {
      id: 'day-staff',
      price: 15,
      adjustable: false,
      enabled: false,
      description: t({
        de: 'Tages-Helfende (pro Tag)', 
        en: 'Daily helpers (per day)'
      })
    },
  ]
};

const PriceAdjustmentForm: React.FC<IPriceAdjustmentForm> = ({onChange, data}) => {
  const t = useTranslation();

  const initialPriceAdjustments: PriceAdjustments = {};
  GetTranslatedPricingClasses(t).filter(value => value.adjustable).forEach(
    value => initialPriceAdjustments[value.id] = value.price);

  // Emit initial state
  if (!Object.keys(data).length) {
    onChange(initialPriceAdjustments);
  }

  const [fixedCalc, setFixedCalc] = React.useState(0);

  return (
    <>
      <FormGroup
        fieldId="fixedCalc"
        helperText={t({
          de: 'Mit dieser Funktion kann für alle Felder unten ein Wert addiert oder substrahiert werden. ' +
            'Die Felder können danach individuell angepasst werden.',
          en: 'Use this button to add or substract a value for all prices, which can then be adjusted.',
        })}>
        <InputGroup>
          <InputGroupText>{t({
            de: 'Differenz',
            en: 'Difference',
          })}</InputGroupText>
          <TextInput
            type="number"
            value={fixedCalc}
            onChange={value => {
              setFixedCalc(parseInt(value));
            }}
            style={{maxWidth: '80px'}}/>
          <InputGroupText>€</InputGroupText>
          <Button id="calcButton" variant="control" onClick={(e) => {
            if (isNaN(fixedCalc)) {
              return
            }

            GetTranslatedPricingClasses(t).filter(value => value.adjustable).forEach((value) => {
              initialPriceAdjustments[value.id] = (value.price + fixedCalc);

              if (initialPriceAdjustments[value.id] < 0) {
                initialPriceAdjustments[value.id] = 0
              }
            });
            onChange(initialPriceAdjustments);
          }}>{t({
            de: 'Berechnen',
            en: 'Calculate',
          })}</Button>
        </InputGroup>
      </FormGroup>
      {GetTranslatedPricingClasses(t).map((entry, index) => (
        <FormGroup
          key={index}
          helperText={entry.adjustable ? '' : t({
            de: 'Nur zur Info - dieser Beitrag kann nicht angepasst werden.',
            en: 'Just FYI - this price cannot be modified.',
          })}
          label={entry.description}
          fieldId={entry.id}>
          <InputGroup>
            <InputGroupText style={{minWidth: '143px'}}>
              {t({
                de: `Listenpreis: ${entry.price}€`,
                en: `List price: ${entry.price}€`,
              })}
            </InputGroupText>
            {entry.adjustable ?
              <>
                <TextInput
                  type="number"
                  min={0}
                  value={data[entry.id]}
                  style={{maxWidth: '80px'}}
                  onBlur={event => {
                    if (isNaN(data[entry.id])) {
                      onChange(
                        {...data, [entry.id]: entry.price});
                    }
                  }}
                  onChange={value => {
                    let price: number;
                    price = parseInt(value);

                    if (entry.adjustable) {
                      onChange(
                        {...data, [entry.id]: price});
                    }
                  }}
                />
                {data[entry.id] !== entry.price ?
                  <InputGroupText>
                    ({(data[entry.id] < entry.price ? "" : "+")}{data[entry.id] - entry.price})
                  </InputGroupText>
                  : null}
                <InputGroupText>€</InputGroupText>
              </>
              : null}
          </InputGroup>
        </FormGroup>
      ))}
    </>
  )
};

export {PriceAdjustmentForm};

