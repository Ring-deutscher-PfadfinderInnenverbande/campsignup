import React from "react";
import {Language, TranslationContext} from "./i18n";
import {
  Dropdown,
  DropdownItem,
  DropdownToggle,
  PageSection,
  PageSectionVariants
} from "@patternfly/react-core";


const LanguageChooser: React.FC<{ children: React.ReactNode }> = (props) => {
  const [language, setLanguage] = React.useState<Language>(Language.de);
  const [isOpen, setIsOpen] = React.useState(false);

  const languageStr: Map<Language, string> = new Map<Language, string>([
    [Language.de, "Deutsch"],
    [Language.en, "English"],
  ]);

  return (
    <>
      <PageSection variant={PageSectionVariants.light} className="hidePrint">
        <Dropdown
          toggle={<DropdownToggle onToggle={() => setIsOpen(!isOpen)}>
            Switch language ({languageStr.get(language)})
          </DropdownToggle>}
          isOpen={isOpen}
          dropdownItems={[
            <DropdownItem
              key="action" component="button"
              autoFocus={language === Language.de}
              onClick={() => {
                setLanguage(Language.de);
                setIsOpen(false);
              }}>
              Deutsch
            </DropdownItem>,
            <DropdownItem
              key="action" component="button"
              autoFocus={language === Language.en}
              onClick={() => {
                setLanguage(Language.en);
                setIsOpen(false);
              }}>
              English
            </DropdownItem>
          ]}
          autoFocus={false}
        />
      </PageSection>
      <TranslationContext.Provider value={language}>
        {props.children}
      </TranslationContext.Provider>
    </>
  )
};

export default LanguageChooser;
