# C.S.R. Sponsor Extensie

## Installatie

### Chrome

#### Develop

1. Kloon deze repository
2. Ga naar [chrome://extensions](chrome://extensions)
3. Klik op de knop "Load unpacked"
4. Selecteer de gekloonde folder

#### Live

De Chrome extensie kan vanuit de Chrome Webstore geïnstalleerd worden: [https://chrome.google.com/webstore/detail/csr-sponsor-extensie/ejhclpanjlbpjjjacdiohlnglmblepol](https://chrome.google.com/webstore/detail/csr-sponsor-extensie/ejhclpanjlbpjjjacdiohlnglmblepol)

### Firefox

#### Develop

1. Kloon deze repository
2. Ga naar [about:debugging#/runtime/this-firefox](about:debugging#/runtime/this-firefox)
3. Klik op de knop "Load Temporary Add-on"
4. Selecteer het `manifest.json` bestand in de gekloonde folder

#### Live

De Firefox extensie kan vanuit de Add-on Store geïnstalleerd worden:
[https://addons.mozilla.org/en-US/firefox/addon/c-s-r-sponsor/](https://addons.mozilla.org/en-US/firefox/addon/c-s-r-sponsor/)

## Updaten van de plugin

### Chrome

1. Log in op [het Chrome Webstore Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. Selecteer de extensie
3. Klik op "Package" in het menu
4. Maak een zipje van de broncode (de `.git` map, `.gitignore` en `README.md` kan je hier buiten laten)
5. Klik op de knop "Upload new package" en selecteer het zipje
6. Klik op de knop "Publish item"

### Firefox

1. Log in op [het Firefox Add-on Developer Hub](https://addons.mozilla.org/en-GB/developers/)
2. Selecteer de extensie
3. Klik op "Upload New Version"
4. Maak een zipje van de broncode (de `.git` map, `.gitignore` en `README.md` kan je hier buiten laten)
5. Selecteer het zipje en volg de stappen

## Hoe de extensie werkt/zou moeten werken
Allereerst de setup-meuk. Voor bol.com werkt het dan als volgt:
1. Gebruiker opent https://www.een-webstek-met-sponsorlink.nl
2. `navigationCompleteListener(event)` wordt aangeroepen, die controleert of de URL in `data["webshops"]` zit
3. Zo ja, dan wordt er een notificatie gestuurd
4. Door dan op de notificatie of het extensie-icoontje te klikken, wordt de URL vervangen door de sponsor-URL
5. De sponsor-URL zorgt verder voor het terug-redirecten, de sponsorextensie moet niets meer te doen voor dit tabblad/deze pagina

De sponsorextensie hoeft niet nog een melding te sturen als het al gedaan is, maar wanneer reset het weer?
Ik denk dat het een van deze opties is:
1. Het wordt permanent opgeslagen in de cookies
    (dan zou je het in de cookies terug kunnen zien, maar hoeft de extensie maar 1x per website te werken)
2. Het wordt gelinkt aan de sessie
    (dan zou je iedere keer dat je de browser opstart dit geheugen van de extensie resetten)
3. Het wordt gelinkt aan je bol.com account
    (geen idee hoe we zo iets tracken in de extensie, ik zou dat hetzelfde aanpakken als 2)
4. Het wordt gelijk vergeten als je de website sluit
    (iedere keer vergelijken met de vorige URL zou dan redelijk in de buurt moeten komen, )


todo:
- Voorkom te veel meldingen
    - Alleen melding sturen als een extra boolean 

vragen:
- Onthouden websites dat een affiliate-link is gebruikt?
- Is er een manier om te checken dat het gebruikt is?