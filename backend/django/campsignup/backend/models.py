from django.db import models
from django.contrib.auth.models import User
from django.conf import settings

from pprint import pprint

from .modules.GenericSerializer import Serializer_permission_all, Serializer_permission_admin, Serializer_permission_owners, Serializer_permission_user, HashIDField

# --------------------------------------------------------------------------------------
# ------------------
# Type definitions

""" The type of participant definition

From web/src/SignupPage/Common.tsx
"""
choices_participantType = [
    ("regular", "Stammesmitglied (außer Leiter)"),
    ("leader", "Leiter*in"),
    ("small_child", "Kinder unter sechs Jahren"),
    ("alumni", "Ehemalige"),
    ("staff", "Helfende")
]

""" The gender definition

From web/src/SignupPage/Common.tsx
"""
choices_gender = [
    ("female", "weiblicher Schnitt"),
    ("male", "männlicher Schnitt"),
]

""" The type of helper definition

From web/src/SignupPage/Common.tsx
"""
choices_staffType = [
    ("subcamp", "Mithilfe in einem Unterlager"),
    ("central", "Mithilfe in der zentralen Organisation"),
]

""" The sub type of helper definition

From web/src/SignupPage/Common.tsx
"""
choices_staffSubtype = [
    ("cafe", "Cafe"),
    ("themeyurt", "Themenjurte"),
    ("equipment", "Ausrüster"),
    ("infrastructure", "Infrastruktur"),
    ("content", "Inhalt"),
    ("international", "Internationales"),
    ("jumper", "Springer"),
]

""" The placementGroups definition

From web/src/SignupPage/Common.tsx
"""
choices_placementGroups = [
    ("Osterinsel", "Osterinsel"),
    ("Prismanien", "Prismanien"),
    ("Wasteland", "Wasteland"),
    ("Erde Feuer Wasser Luft", "Erde Feuer Wasser Luft"),
    ("Brownsea Island", "Brownsea Island"),
    ("Atlantis", "Atlantis"),
    ("Neupfadland", "Neupfadland"),
    ("St. Goldvein", "St. Goldvein"),
    ("Espuertes", "Espuertes"),
]

""" The parentOrgsStatic definition

From web/src/SignupPage/GroupSignupPage.tsx
"""

choices_parentOrgsStatic = [
  ('DPSG Rottenburg-Stuttgart', 'DPSG Rottenburg-Stuttgart'),
  ('PSG Rottenburg-Stuttgart', 'PSG Rottenburg-Stuttgart'),
  ('DPSG Freiburg', 'DPSG Freiburg'),
  ('PSG Freiburg', 'PSG Freiburg'),
  ('VCP Baden', 'VCP Baden'),
  ('VCP Württemberg', 'VCP Württemberg'),
  ('BdP Baden-Württemberg', 'BdP Baden-Württemberg'),
  ('International guest', 'International guest'),
]

""" The foodOptions definition

From web/src/SignupPage/Common.tsx
"""
choices_foodOptions = [
    ("vegetarian", "Vegetarisch"),
    ("vegan", "Vegan"),
    ("meat", "Fleisch"),
]

""" The dayVisitorMealChoices definition

From web/src/SignupPage/Common.tsx
"""
choices_dayVisitorMealChoices = [
    ("breakfast", "Frühstück"),
    ("lunch", "Mittagessen"),
    ("dinner", "Abendessen"),
]

""" The publicTransport definition

From web/src/SignupPage/GroupSignupPage.tsx
"""
choices_publicTransport = [
    ("train", "Bahn"),
    ("bus", "Bus"),
    ("other", "Keine Anreise mit ÖPNV"),
]

""" The driversLicenses definition

From web/src/SignupPage/GroupSignupPage.tsx
"""
choices_staffQualDrivingLicense = [
    ("---", "---"),
    ("B1", "B1"),
    ("B", "B"),
    ("BE", "BE"),
    ("C", "C"),
    ("D", "D"),
]

""" Allowed T-Shirt sizes.

From web/src/SignupPage/ParticipantSignupPage.tsx
"""
choices_tshirtSize = [
    ('122-128', '122-128'),
    ('134-140', '134-140'),
    ('146-154', '146-154'),
    ('XS', 'XS'),
    ('S', 'S'),
    ('M', 'M'),
    ('L', 'L'),
    ('XL', 'XL'),
    ('XXL', 'XXL'),
    ('XXXL', 'XXXL')
]

""" Allowed Ranks.

From web/src/SignupPage/ParticipantSignupPage.tsx
"""
choices_rank = [
    (1, 'Wölflinge (1)'),
    (2, 'Jungpfadfinder (2)'),
    (3, 'Pfadfinder (3'),
    (4, 'Rover (4)'),
]

# --------------------------------------------------------------------------------------
# ------------------
# Data Scheme

"""Contact Data Scheme

Scheme copied from frontend: /web/src/SignupPage/ContactForm.tsx
Serialization will most likely be done in SerializerParticipant
"""
class Contact(models.Model):
    fullName = models.CharField(max_length=settings.CHARFIELD_LENGTH)
    address = models.CharField(max_length=settings.CHARFIELD_LENGTH)
    phone = models.CharField(max_length=settings.CHARFIELD_LENGTH)
    email = models.CharField(max_length=settings.CHARFIELD_LENGTH, blank=True)
    misc = models.TextField(blank=True)

    def __str__(self):
        return f"{self.fullName} (id{self.id})"

    def __unicode__(self):
        return f"{self.fullName} (id{self.id})"

# --------------------------------------------------------------------------------------

"""Group Data Scheme

Scheme copied from frontend: /web/src/SignupPage/GroupSignupPage.tsx
Also remeber to change SerializerGroup
"""
class Group(models.Model):
    owner = models.ForeignKey(User, verbose_name="Besitzer", related_name='grps', help_text="Benutzer, dem diese Gruppe gehoert", null=True, on_delete=models.PROTECT) # Owner so that we can use permissions in JWT without extra code
    more_owners = models.ManyToManyField(User, verbose_name="Weitere Besitzer", related_name='more_grps', help_text="Ein weiteres Array Feld, in dem das FrontEnd E-Mails ablegen kann, falls für die jeweilige Mail ein Benutzer gefunden wird, wird er hier verlinkt und erhält dann automatisch 'Owner' Rechte auf die Gruppe", null=True, default=None, blank=True)

    agbAgreedContact = models.BooleanField(verbose_name="AGB-Einverständnis Gruppenverantwortlicher", help_text="Gruppenverantwortlicher hat AGB zugestimmt", default=False)
    contactName = models.CharField(verbose_name="Name Gruppenverantwortlicher", help_text="Name der Person, welche die Gruppierung repräsentiert und kontaktiert werden soll", max_length=settings.CHARFIELD_LENGTH, blank=True)
    contactAddress = models.CharField(verbose_name="Adresse Gruppenverantwortlicher", help_text="Adresse der Person, welche die Gruppierung repräsentiert und kontaktiert werden soll", max_length=settings.CHARFIELD_LENGTH, blank=True)
    contactMail = models.CharField(verbose_name="Mail Gruppenverantwortlicher", help_text="Mail der Person, welche die Gruppierung repräsentiert und kontaktiert werden soll", max_length=settings.CHARFIELD_LENGTH, blank=True)
    contactPhone = models.CharField(verbose_name="Telefon Gruppenverantwortlicher", help_text="Telefon der Person, welche die Gruppierung repräsentiert und kontaktiert werden soll", max_length=settings.CHARFIELD_LENGTH, blank=True)

    firstPlacementChoice = models.CharField(verbose_name="Unterlager, 1. Wahl", choices=choices_placementGroups, help_text="Unterlager-Wunsch der Gruppierung. 1. Wahl", max_length=settings.CHARFIELD_LENGTH, blank=True)
    secondPlacementChoice = models.CharField(verbose_name="Unterlager, 2. Wahl", choices=choices_placementGroups, help_text="Unterlager-Wunsch der Gruppierung. 2. Wahl", max_length=settings.CHARFIELD_LENGTH, blank=True)
    thirdPlacementChoice = models.CharField(verbose_name="Unterlager, 3. Wahl", choices=choices_placementGroups, help_text="Unterlager-Wunsch der Gruppierung. 3. Wahl", max_length=settings.CHARFIELD_LENGTH, blank=True)

    priceAdjustments = models.CharField(verbose_name="Individuelle Preise", help_text="Damit die Teilnehmenden bei der Anmeldung den für sie gültigen Preis sehen können.", max_length=settings.CHARFIELD_LONG_LENGTH, blank=True)

    isIntlGroup = models.BooleanField(verbose_name="Internationale Gruppierung", help_text="Auswahl, ob Gruppierung aus dem Ausland kommt.", default=False)
    existingIntlGroup = models.CharField(verbose_name="Name einer vorhandenen Partnergruppe", help_text="Falls bereits eine Partnerschaft mit einer internationalen Gruppe besteht, die ebenfalls auf das Lager fährt, könnt ihr hier den Namen angeben. Als internationale Gruppe gebt ihr hier den Namen eurer deutschen Partnergruppe an, falls bereits eine Partnerschaft besteht.", max_length=settings.CHARFIELD_LENGTH, blank=True)
    wantIntlGroup = models.BooleanField(verbose_name="Aufnahme Internationale Gruppierung", help_text="Zeigt an, ob die Gruppierung eine internationale Partnergruppierung aufnehmen möchte.", default=False)

    name = models.CharField(verbose_name="Gruppierungsname", help_text="Der Name der Gruppierung", max_length=settings.CHARFIELD_LENGTH, blank=True)
    mixedOrg = models.BooleanField(verbose_name="Individuelle Verbandszugehörigkeit", help_text="Falls dieser Haken gesetzt ist, müssen Teilnehmer bei der Anmeldung ihre eigene Verbandszugehörigkeit bestätigen.", default=False)
    parentOrg = models.CharField(verbose_name="Verbandszugehörigkeit", choices=choices_parentOrgsStatic, help_text="Pfadfinder-Verband des Teilnehmers, z.B. DPSG, PSG, BDP ...", max_length=settings.CHARFIELD_LENGTH, blank=True)
    parentOrgOther = models.CharField(verbose_name="Weitere Verbandszugehörigkeit", help_text="Freitext-Feld für Verbandszugehörigkeit (z.B. bei internationalen Teilnehmern", max_length=settings.CHARFIELD_LENGTH, blank=True)

    agbAgreedOrg = models.BooleanField(verbose_name="AGB-Einverständnis Gruppe", help_text="Gruppierung hat AGB zugestimmt", default=False)
    allowEarlyDeparture = models.BooleanField(verbose_name="Frühzeitige Abreise erlauben", help_text="Gruppierung erlaubt den Teilnehmern das frühzeitige abreisen", default=False)
    communalEarlyDeparture = models.BooleanField(verbose_name="Organisation der früheren Abreise", help_text="Bitte bei der Anpassung der Preise beachten. Falls der Stamm keine frühe Abreise organisiert, muss diese individuell von den Erziehungsberechtigten organisiert werden.", default=False)
    requireEarlyDeparture = models.BooleanField(verbose_name="Verpflichtende frühere Abreise für Wichtel/Wölflinge", help_text="Wichtel/Wölflinge haben nur die Option, früh abzureisen.", default=False)
    publicTransport = models.CharField(verbose_name="Anreise mit öffentlichen Verkehrsmitteln", choices=choices_publicTransport, help_text="Wir müssen die öffentlichen Verkehrsbetriebe rechtzeitig über die zu erwartenden Passagierzahlen informieren, damit diese genug Kapazitäten bereitstellen können. Falls euer Stamm plant, mit den öffentlichen Verkehrsmitteln per Bus oder Bahn anzureisen, gebt dies bitte hier an. Wenn ihr die Anreise anderweitig organisiert, etwa mit einem eigenen Bus, wählt bitte 'Keine Anreise mit ÖPNV'", max_length=settings.CHARFIELD_LENGTH, blank=True)
    billingAddress = models.CharField(verbose_name="Rechnungsadresse", help_text="Die Rechnungsadresse der Gruppierung", max_length=settings.CHARFIELD_LENGTH, blank=True)
    extraText = models.CharField(verbose_name="Informationen für die Teilnehmer", help_text="Ihr könnt hier optional einen Text hinterlegen, der Euren Teilnehmenden bei der Registrierung angezeigt wird, etwa für weitere Hinweise zum Ablauf und der Bezahlung.", max_length=settings.CHARFIELD_LENGTH, blank=True)

    def hashid(self):
        field = HashIDField()
        return field.to_representation(self.id)

    def __str__(self):
        return f"{self.name} (id{self.id})"

    def __unicode__(self):
        return f"{self.name} (id{self.id})"

    serializerFieldPermissions = {
        "id": {
            "read": [Serializer_permission_all]
        },
        "name": {
            "read": [Serializer_permission_all]
        },
        "priceAdjustments": {
            "read": [Serializer_permission_all]
        },
        "parentOrg": {
            "read": [Serializer_permission_all]
        },
        "mixedOrg": {
            "read": [Serializer_permission_all]
        },
        "allowEarlyDeparture": {
            "read": [Serializer_permission_all]
        },
        "requireEarlyDeparture": {
            "read": [Serializer_permission_all]
        },
        "communalEarlyDeparture": {
            "read": [Serializer_permission_all]
        },
        "extraText": {
            "read": [Serializer_permission_all]
        },
        "*": {
            "read": [Serializer_permission_owners],
            "create": [Serializer_permission_user],
            "update": [Serializer_permission_owners],
        }
    }


# --------------------------------------------------------------------------------------

"""Participant Data Scheme

Scheme copied from frontend: /web/src/SignupPage/ParticipantSignupPage.tsx
Also remeber to change SerializerParticipant
"""
class Participant(models.Model):
    owner = models.ForeignKey(User, verbose_name="Besitzer", related_name='participants', help_text="Benutzer, dem dieser Teilnehmereintrag gehoert", null=True, on_delete=models.PROTECT) # Owner so that we can use permissions in JWT without extra code
    group = models.ForeignKey(Group, verbose_name="Gruppierung", help_text="Die Gruppierung des Teilnehmers", related_name='participants', on_delete=models.PROTECT)

    fullName = models.CharField(verbose_name="Name", help_text="Voller Name, Vorname und Nachname", max_length=settings.CHARFIELD_LENGTH)
    parentOrg = models.CharField(verbose_name="Verbandszugehörigkeit", help_text="Pfadfinder-Verband des Teilnehmers, z.B. DPSG, PSG, BDP ...", choices=choices_parentOrgsStatic, max_length=settings.CHARFIELD_LENGTH, blank=True)
    parentOrgOther = models.CharField(verbose_name="Weitere Verbandszugehörigkeit", help_text="Freitext-Feld für Verbandszugehörigkeit (z.B. bei internationalen Teilnehmern", max_length=settings.CHARFIELD_LENGTH, blank=True)
    dateOfBirth = models.DateField(verbose_name="Geburtstag", help_text="Geburtsdatum des Teilnehmers.", null=True, blank=True)
    participantType = models.CharField(verbose_name="Teilnehmerkategorie", help_text="Teilnehmer Typ, evtl. können wir darüber Berechtigungen ableiten?", max_length=settings.CHARFIELD_LENGTH, choices=choices_participantType, blank=True)
    rank = models.IntegerField(verbose_name="Altersstufe", help_text="Die Altersstufe des Teilnehmers, da unterschiedlich je nach Verband, muss das im Frontend gefiltert sein.", choices=choices_rank, max_length=settings.CHARFIELD_LENGTH, blank=True, null=True)
    rankLeader = models.CharField(verbose_name="Stufenleiter", help_text="Falls Teilnehmer ein Stufenleiter ist, steht hier die Stufe.", max_length=settings.CHARFIELD_LENGTH, blank=True)
    smallChildRef = models.ManyToManyField('self', symmetrical=False, verbose_name="Erziehungsberechtigter", default=None, related_name="children", help_text="Die Kategorie 'Kinder unter sechs Jahren' ist nur für Kinder gedacht, die mit einer erziehungsberechtigten Person anreisen und nicht am Programm teilnehmen. Dieses Feld ist ein String Feld mit dem 'FullName' des Erziehungsberechtigten. Im Hintergrund prüft und verküpft das Backend den FullName mit einem oder mehreren (falls FullName nicht eindeutig ist) existierenden Teilnehmern.", blank=True)
    rate = models.CharField(verbose_name="Beitrags-Rate", help_text="Beitrags-Rate. Berechnung soll im Backend passieren. UNKLAR: Momentan TODO", max_length=settings.CHARFIELD_LENGTH, blank=True)

    foodOptions = models.CharField(verbose_name="Essen", help_text="Auswahl der Essens-Art.", max_length=settings.CHARFIELD_LENGTH, choices=choices_foodOptions, blank=True)
    maySwim = models.BooleanField(verbose_name="Darf Schwimmen", help_text="Ja: Teilnehmer hat Schwimmerlaubnis", default=False)

    requiredMedecine = models.TextField(verbose_name="Benötigte Medikamente", help_text="Freitextfeld, um benötigte Medikamente eintragen zu können.", blank=True)
    foodIntolerances = models.TextField(verbose_name="Lebensmittel-Unverträglichkeiten", help_text="Freitextfeld, um Lebensmittel-Unverträglichkeiten einzugeben.", blank=True)
    allergies = models.TextField(verbose_name="Allergien", help_text="Freitextfeld, um Allergien anzugeben", blank=True)

    ownContact = models.ForeignKey(Contact, verbose_name="Eigene Kontaktdaten", help_text="Die Kontaktdaten des Teilnehmers", related_name='participants_own', default=None, null=True, blank=True, on_delete=models.PROTECT)
    guardianContact = models.ForeignKey(Contact, verbose_name="Erziehungsberechtigter Kontaktdaten", help_text="Die Kontaktdaten des/der Erziehungsberechtigten", related_name='participants_guardian', blank=True, default=None, null=True, on_delete=models.PROTECT)
    emergencyContacts = models.ManyToManyField(Contact, verbose_name="Weitere Notfall-Kontaktdaten", help_text="Falls weitere Notfall-Kontaktdaten benötigt werden", default=None, blank=True, null=True, related_name='participants_emergency')
    familyMember = models.ManyToManyField('self', symmetrical=False, verbose_name="Name eines weiteren Familienmitglieds", help_text="Für die Buchung des Familienpreises muss hier der Name des bereits angemeldeten, den Vollpreis zahlenden Familienmitglieds angegeben werden.", related_name='familyMembers', default=None, null=True, blank=True)

    dayVisitor = models.BooleanField(verbose_name="Tagesgast", help_text="Tagesgast, falls der Teilnehmer nicht ganze Zeit da ist.", default=False)
    dayVisitorArrival = models.DateField(verbose_name="Anreisetag", help_text="Anreisetag bei Tagesgast.", blank=True, null=True)
    dayVisitorDeparture = models.DateField(verbose_name="Abreisetag", help_text="Abreisetag bei Tagesgast.", blank=True, null=True)
    dayVisitorArrivalMeal = models.CharField(verbose_name="Essen am Anreisetag", help_text="Letzte noch genutzte Malzeit am Anreisetag.", choices=choices_dayVisitorMealChoices, max_length=settings.CHARFIELD_LENGTH, blank=True)
    dayVisitorDepartureMeal = models.CharField(verbose_name="Essen am Abreisetag", help_text="Letzte noch genutzte Malzeit am Abreisetag.", choices=choices_dayVisitorMealChoices, max_length=settings.CHARFIELD_LENGTH, blank=True)

    tshirtSize = models.CharField(verbose_name="T-Shirt Größe", help_text="T-Shirt Größe für Lagershirt", choices=choices_tshirtSize, max_length=settings.CHARFIELD_LENGTH, blank=True)
    gender = models.CharField(verbose_name="T-Shirt-Schnitt", help_text="Wie das Lager-Shirt geschnitten sein soll", choices=choices_gender, max_length=settings.CHARFIELD_LENGTH, blank=True)
    awarenessTraining = models.CharField(verbose_name="Schutzschulung", help_text="Teilnehmer über 18 Jahre müssen eine Schutzschulung bezüglich sexualisierter Gewalt vorweisen", max_length=settings.CHARFIELD_LENGTH, blank=True)

    staffDays = models.CharField(verbose_name="Tage als Helfer", help_text="An welchen Tagen stehst der Teilnehmer als Helfer zur Verfügung? Eigentlich ein Date-Array, aber da muss ich noch schauen, wie das am besten in DB landet. Denke String List ist am einfachsten.", max_length=settings.CHARFIELD_MID_LENGTH, blank=True) # Arrayfield, set in serializer
    staffProfession = models.CharField(verbose_name="Ausgeübter Beruf", help_text="Ausgeübter Beruf des Helfers (falls relevant)", max_length=settings.CHARFIELD_LENGTH, blank=True)
    staffLanguages = models.CharField(verbose_name="Sprachkentnisse", help_text="Liste mit Sprachen die der Helfer sprechen kann (sehr gut bis fließend).", max_length=settings.CHARFIELD_MID_LENGTH, blank=True) # Arrayfield, set in serializer
    staffLanguagesOther = models.CharField(verbose_name="Sonstige Sprachen", help_text="Liste mit Sprachen die der Helfer nicht so gut sprechen kann", max_length=settings.CHARFIELD_LENGTH, blank=True)

    staffQualDrivingLicense = models.CharField(verbose_name="Führerscheinklasse", help_text="Höchstwertigste Führerscheinklasse des Helfers.", choices=choices_staffQualDrivingLicense, max_length=settings.CHARFIELD_LENGTH, blank=True)
    staffQualChainsawLicense = models.BooleanField(verbose_name="Kettensägenschein", help_text="Der Helfende verfügt über einen Kettensägen-Schein und darf eine Kettensäge führen.", default=False)
    staffQualProfessionalDriver = models.BooleanField(verbose_name="Personenbeförderungsschein", help_text="Der helfende ist ein Berufsfahrer mit Personenbeförderungsschein(Ja/Nein)", default=False)
    staffQualElectrician = models.BooleanField(verbose_name="Elektrikerausbildung", help_text="Helfer ist ein gelernter Elektriker", default=False)
    staffQualOther = models.CharField(verbose_name="Weitere Qualifikationen", help_text="Weitere nützliche Qualifikationen des Helfers", max_length=settings.CHARFIELD_LENGTH, blank=True)

    staffBackgroundCheck = models.BooleanField(verbose_name="Führungszeugnis-Einsicht", help_text="Das Führungszeugnis des Helfers wurde zwecks Schutz vor sexualisierter Gewalt geprüft.", default=False)
    staffFancyAwarenessThingy = models.BooleanField(verbose_name="Selbstverpflichtungserkärung", help_text="Der Teilnehmer hat die Selbstverpflichtungserkärung gelesen, ist damit einverstanden und bringt sie unterschrieben zum Lager mit", default=False)
    staffInsured = models.BooleanField(verbose_name="Haftpflicht versichert", help_text="Zeigt an, ob der Helfer haftpflicht versichert ist. Die Haftpflichtversicherung kann sowohl über einen Pfadfinderverband und Institution oder eine private Haftpflicht bestehen.", default=False)
    staffHasTent = models.BooleanField(verbose_name="Eigenes Zelt", help_text="Der Helfer hat ein eigenes Zelt dabei.", default=False)
    staffTentExtra = models.CharField(verbose_name="Freie Schlafplätze im Zelt", help_text="Falls weitere Plätze im Zelt vorhanden sind, hier Anzahl angeben", max_length=settings.CHARFIELD_LENGTH, blank=True)
    staffOnsiteGuardian = models.CharField(verbose_name="Aufsichtsperson", help_text="Für minderjährige Helfer die Aufsichtperson auf dem Lager.", max_length=settings.CHARFIELD_LENGTH, blank=True)
    staffChildcare = models.CharField(verbose_name="Kinderbetreuung", help_text="Kinderbetreuung für die Kinder des Helfers. Alle mitgebrachten Kinder müssen separat zum Lager angemeldet werden.", max_length=settings.CHARFIELD_MID_LENGTH, blank=True) # Arrayfield, set in serializer
    staffType = models.CharField(verbose_name="Helfendenkategorie", help_text="Ob der Helfer in einem Bereich oder Unterlager sich engangieren möchte.", choices=choices_staffType, max_length=settings.CHARFIELD_LENGTH, blank=True)
    staffSubtype = models.CharField(verbose_name="Mithilfe in Bereich", help_text="In welchem Bereich der Helfer sich engagieren möchte", choices=choices_staffSubtype, max_length=settings.CHARFIELD_LENGTH, blank=True)
    staffSubcamp = models.CharField(verbose_name="Mithilfe in Unterlager", help_text="In welchem Unterlager sich der Helfende engangieren möchte.", choices=choices_placementGroups, max_length=settings.CHARFIELD_LENGTH, blank=True)

    staffFreeDayVisitor = models.BooleanField(verbose_name="Kostenloser Tageshelfender", help_text="Nur zu Auf- und/oder Abbau da, daher kostenlos.", default=False)

    medicalSheet = models.BooleanField(verbose_name="Gesundheitsbogen", help_text="Gesundheitsbogen ausgedruckt und ausgefüllt, wird mitgebracht.", default=False)
    pictureAgreement = models.BooleanField(verbose_name="Bild-Einverständnis", help_text="Der Teilnehmer hat sein Einverständnis gegeben, dass er auf Lagerbildern abgebildet werden darf.", default=False)
    gdprAgreed = models.BooleanField(verbose_name="Datenschutz-Einverständnis", help_text="Der Teilnehmer ist mit der Lager-Datenschutzerklärung einverstanden.", default=False)
    agbAgreed = models.BooleanField(verbose_name="AGB-Einverständnis", help_text="Der Teilnehmer hat den Lager AGB zugestimmt.", default=False)

    def __str__(self):
        return f"{self.fullName} (id{self.id})"

    def __unicode__(self):
        return f"{self.fullName} (id{self.id})"

    serializerFieldPermissions = {
        "rate": {
            "read": [Serializer_permission_owners],
            "create": [Serializer_permission_user],
            "update":[Serializer_permission_admin]
        },
        "*": {
            "read": [Serializer_permission_owners],
            "create": [Serializer_permission_user],
            "update": [Serializer_permission_owners],
        }
    }

