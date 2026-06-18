# RideLog - Mobile App Design

## Übersicht
RideLog ist eine Tracking- und Statistik-Plattform für Sport- und Bikepark-Aktivitäten. Die App hilft Nutzern, ihre Sessions zu loggen, Ziele zu verfolgen und die finanzielle Ersparnis von Saisonkarten automatisch zu berechnen.

## Screen-Liste

1. **Dashboard (Home)** – Startseite mit Überblick
2. **Logbuch (Log)** – Filterbare Aktivitätsliste mit Kalender-/Listenansicht
3. **Bucket-List (Bucket)** – To-Do-Liste für sportliche Meilensteine
4. **Pass-Rechner (Passes)** – Verwaltung und Berechnung von Saisonkarten
5. **Statistiken (Stats)** – Visuelle Auswertungen mit Heatmap und Ranking
6. **Einstellungen (Settings)** – Konfiguration, Datenexport und neue Einträge

## Primärer Inhalt und Funktionalität

### 1. Dashboard (Home)
**Zweck:** Schneller Überblick über aktuelle Aktivitäten und Statistiken.

**Inhalte:**
- Persönliche Begrüßung (z.B. "Hallo, Max!")
- Schnellstatistiken:
  - Aktivitäten diesen Monat
  - Aktivitäten dieses Jahr
  - Aktive Streak (Tage in Folge mit Aktivitäten)
  - Gesamte Pass-Ersparnis (€)
- Letzte 3 Aktivitäten als Vorschau (Karte mit Ort, Datum, Kategorie)
- Floating Action Button (FAB) zum Erstellen neuer Einträge

**Funktionalität:**
- Tippen auf Vorschau-Karte → Detailansicht der Aktivität
- FAB → EntryModal öffnen
- Statistiken aktualisieren sich automatisch beim Fokus

---

### 2. Logbuch (Log)
**Zweck:** Vollständige Übersicht aller Aktivitäten mit Filterung.

**Inhalte:**
- Umschaltung zwischen Listenansicht und Kalenderansicht
- Filteroptionen nach Kategorie (Bikepark, Mountainbike, Skifahren, Laufen, etc.)
- Für Listenansicht: Chronologische Liste mit Datum, Ort, Kategorie, Kosten
- Für Kalenderansicht: Monatskalender mit Aktivitätstagen markiert

**Funktionalität:**
- Tippen auf Aktivität → Detailansicht/Bearbeitung
- Swipe zum Löschen
- Filterung nach Kategorie (Chips/Tags)
- Datumsbereich-Filterung optional

---

### 3. Bucket-List (Bucket)
**Zweck:** Verwaltung sportlicher Ziele und Meilensteine.

**Inhalte:**
- Liste von Zielen mit:
  - Titel (z.B. "Whip lernen")
  - Kategorie (z.B. Bikepark, Freestyle)
  - Priorität (Hoch, Mittel, Niedrig) – visuell durch Farbe
  - Status (Offen / Erledigt)
- Checkbox zum Abhaken von erledigten Zielen
- Löschen-Button

**Funktionalität:**
- Tippen auf Ziel → Bearbeitung
- Checkbox → Ziel als erledigt markieren
- Löschen-Button → Ziel entfernen
- Neue Ziele über Settings-Seite hinzufügen

---

### 4. Pass-Rechner (Passes)
**Zweck:** Verwaltung und Berechnung von Saisonkarten-Ersparnissen.

**Inhalte:**
- Liste der Saisonkarten mit:
  - Name (z.B. "Gravity Card")
  - Kaufpreis (€)
  - Anzahl der Besuche
  - Break-Even-Point (ab wann sich die Karte lohnt)
  - Fortschrittsbalken (Besuche vs. Break-Even)
  - Finanzielle Ersparnis (€) im Vergleich zu Einzeltickets
- Zusammenfassung: Gesamtersparnis aller Karten

**Funktionalität:**
- Tippen auf Karte → Detailansicht
- Besuche inkrementieren/dekrementieren
- Karte löschen
- Neue Karten über Settings hinzufügen

---

### 5. Statistiken (Stats)
**Zweck:** Visuelle Auswertung der Aktivitäten.

**Inhalte:**
- **Aktivitäts-Heatmap:** Grid mit 14 Tagen (ähnlich GitHub Contributions)
  - Jedes Quadrat = ein Tag
  - Farbe zeigt Aktivitätsintensität (leer/gefärbt)
- **Häufigkeit nach Sportart:** Ranking-Liste
  - Kategorie → Anzahl der Aktivitäten
  - Sortiert nach Häufigkeit (absteigend)

**Funktionalität:**
- Heatmap zeigt letzte 14 Tage
- Ranking aktualisiert sich automatisch

---

### 6. Einstellungen (Settings)
**Zweck:** Konfiguration, Datenverwaltung und neue Einträge.

**Inhalte:**
- **Neue Saisonkarte:**
  - Name (z.B. "Gravity Card")
  - Kaufpreis (€)
  - Tagesticket Jugend (€)
  - Tagesticket Erwachsene (€)
  - Benutzergruppe (Jugend / Erwachsener)
  - Button: "Karte Speichern"

- **Neues Bucket-List Ziel:**
  - Titel (z.B. "Whip lernen")
  - Kategorie (Dropdown)
  - Priorität (Hoch / Mittel / Niedrig)
  - Button: "Ziel Hinzufügen"

- **Datensicherheit:**
  - Button: "Lokal als JSON exportieren"
  - Speichert alle Daten als JSON-Datei

**Funktionalität:**
- Formulare mit Validierung
- Speichern → Daten in Datenbank
- Export → JSON-Datei herunterladen

---

## Wichtige User Flows

### Flow 1: Neue Aktivität loggen
1. Nutzer tippt FAB auf Dashboard
2. EntryModal öffnet sich (Overlay, nicht neue Seite)
3. Formular mit Feldern:
   - Ort/Bikepark (Text)
   - Kategorie (Chips/Buttons zur Auswahl)
   - Notizen (Text, optional)
   - Kosten (Zahl, optional)
4. Nutzer füllt aus und tippt "Speichern"
5. Modal schließt sich, Daten werden in Datenbank gespeichert
6. Dashboard aktualisiert sich automatisch

### Flow 2: Aktivitäten filtern und anschauen
1. Nutzer navigiert zu Logbuch
2. Wählt Kategorie-Filter (z.B. "Bikepark")
3. Liste zeigt nur gefilterte Aktivitäten
4. Nutzer tippt auf Aktivität
5. Detailansicht öffnet sich
6. Nutzer kann bearbeiten oder löschen

### Flow 3: Pass-Ersparnis berechnen
1. Nutzer navigiert zu Pass-Rechner
2. Sieht Liste seiner Saisonkarten
3. Tippen auf Karte → Detailansicht
4. Besuche inkrementieren (z.B. +1)
5. Break-Even und Ersparnis berechnen sich automatisch
6. Gesamtersparnis auf Dashboard aktualisiert sich

### Flow 4: Statistiken anschauen
1. Nutzer navigiert zu Statistiken
2. Sieht Heatmap der letzten 14 Tage
3. Sieht Ranking der Sportarten
4. Daten aktualisieren sich automatisch bei neuen Aktivitäten

---

## Farb-Palette (iOS HIG konform)

| Farbe | Hex | Verwendung |
|-------|-----|-----------|
| **Primary (Tint)** | `#0a7ea4` | Buttons, Links, aktive Elemente |
| **Background** | `#ffffff` (Light) / `#151718` (Dark) | Bildschirmhintergrund |
| **Surface** | `#f5f5f5` (Light) / `#1e2022` (Dark) | Karten, Eingabefelder |
| **Foreground** | `#11181C` (Light) / `#ECEDEE` (Dark) | Primärer Text |
| **Muted** | `#687076` (Light) / `#9BA1A6` (Dark) | Sekundärer Text |
| **Border** | `#E5E7EB` (Light) / `#334155` (Dark) | Trennlinien |
| **Success** | `#22C55E` | Erfolgs-Feedback |
| **Warning** | `#F59E0B` | Warnungen |
| **Error** | `#EF4444` | Fehler |

**Prioritäts-Farben für Bucket-List:**
- Hoch: `#EF4444` (Rot)
- Mittel: `#F59E0B` (Orange)
- Niedrig: `#22C55E` (Grün)

---

## Layout-Prinzipien

- **Portrait-Orientierung (9:16):** Alle Screens sind für Hochformat optimiert
- **One-Handed Usage:** Wichtige Buttons sind im unteren Bereich erreichbar
- **Tab Bar Navigation:** 5 Tabs für Hauptseiten (Home, Log, Bucket, Passes, Stats)
- **Settings:** Separate Seite für Konfiguration (über Zahnrad-Icon in Tab Bar oder Settings-Tab)
- **SafeArea:** Alle Inhalte respektieren Notch und Home Indicator
- **Konsistente Abstände:** 16px Padding, 8px Gaps zwischen Elementen

---

## Komponenten-Übersicht

- **ScreenContainer:** SafeArea-Wrapper für alle Screens
- **EntryModal:** Overlay-Komponente für neue Aktivitäten (nicht im Routing)
- **ActivityCard:** Karte für Aktivitäts-Vorschau
- **PassCard:** Karte für Saisonkarten mit Fortschrittsbalken
- **BucketItem:** Listenitem für Bucket-List-Ziele
- **HeatmapGrid:** Grid für Aktivitäts-Heatmap
- **CategoryChips:** Buttons zur Kategorie-Auswahl
- **StatCard:** Karte für Schnellstatistiken

---

## Daten-Struktur

### Activity (Aktivität)
```
{
  id: string (UUID)
  date: Date
  location: string
  category: string (enum: Bikepark, Mountainbike, Skifahren, Laufen, etc.)
  notes: string (optional)
  cost: number (optional)
  createdAt: Date
}
```

### BucketItem (Ziel)
```
{
  id: string (UUID)
  title: string
  category: string
  priority: string (enum: High, Medium, Low)
  completed: boolean
  createdAt: Date
}
```

### Pass (Saisonkarte)
```
{
  id: string (UUID)
  name: string
  purchasePrice: number
  youthDayPrice: number
  adultDayPrice: number
  userGroup: string (enum: Youth, Adult)
  visits: number
  createdAt: Date
}
```

---

## Nächste Schritte

1. Datenbankschema in Drizzle ORM definieren
2. Hauptseiten implementieren (Dashboard, Logbuch, Bucket-List, Pass-Rechner, Statistiken, Einstellungen)
3. EntryModal als Overlay-Komponente entwickeln
4. Datenlogik und Berechnungen implementieren
5. App-Logo generieren und Branding aktualisieren
6. Tests und Feinschliff
