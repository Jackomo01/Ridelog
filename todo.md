# RideLog - Project TODO

## Database & Models
- [x] Datenbankschema in Drizzle ORM definieren (Activity, BucketItem, Pass)
- [x] Datenbankmigrationen durchführen

## Navigation & Routing
- [x] Tab-Navigation mit 5 Hauptseiten konfigurieren (Home, Log, Bucket, Passes, Stats)
- [x] Icon-Mappings für Tab Bar hinzufügen
- [x] Settings als separate Seite oder Modal implementieren

## Dashboard (Home)
- [x] Persönliche Begrüßung anzeigen
- [x] Schnellstatistiken berechnen und anzeigen (Aktivitäten Monat/Jahr, Streak, Pass-Ersparnis)
- [x] Letzte 3 Aktivitäten als Vorschau anzeigen
- [x] Floating Action Button (FAB) implementieren
- [x] FAB öffnet EntryModal
- [x] Automatische Aktualisierung beim Fokus

## Logbuch (Log)
- [x] Listenansicht mit allen Aktivitäten implementieren
- [ ] Kalenderansicht implementieren
- [x] Umschaltung zwischen Ansichten
- [x] Filterung nach Kategorie implementieren
- [x] Aktivitäten chronologisch sortieren
- [x] Tippen auf Aktivität → Edit-Modal
- [x] Swipe zum Löschen mit Undo implementieren

## Bucket-List (Bucket)
- [x] Liste von Zielen anzeigen
- [x] Checkbox zum Abhaken von Zielen
- [x] Prioritäts-Farben anwenden (Hoch/Mittel/Niedrig)
- [x] Ziele löschen
- [ ] Tippen auf Ziel → Bearbeitung

## Pass-Rechner (Passes)
- [x] Liste der Saisonkarten anzeigen
- [x] Break-Even-Punkt berechnen
- [x] Finanzielle Ersparnis berechnen
- [x] Fortschrittsbalken anzeigen
- [x] Besuche inkrementieren/dekrementieren
- [x] Gesamtersparnis berechnen
- [x] Karten löschen

## Statistiken (Stats)
- [x] Aktivitäts-Heatmap für letzte 14 Tage implementieren
- [x] Häufigkeit nach Sportart berechnen und anzeigen
- [x] Ranking-Liste sortieren
- [x] Automatische Aktualisierung

## Einstellungen (Settings)
- [x] Formular für neue Saisonkarte implementieren
- [x] Formular für neues Bucket-List-Ziel implementieren
- [x] JSON-Export implementieren
- [ ] JSON-Import implementieren
- [x] Formulare mit Validierung
- [x] Speichern-Buttons funktional

## EntryModal (Komponente)
- [x] Modal-Komponente als Overlay implementieren (nicht im Routing)
- [x] Formular mit Feldern: Ort, Kategorie, Notizen, Kosten
- [x] Kategorie-Auswahl via Chips
- [x] Speichern-Button
- [x] Abbrechen-Button
- [x] Modal schließt sich nach Speichern
- [x] Daten werden in Datenbank gespeichert

## UI-Komponenten
- [ ] ActivityCard für Aktivitäts-Vorschau
- [ ] PassCard mit Fortschrittsbalken
- [ ] BucketItem für Ziele
- [ ] HeatmapGrid für Statistiken
- [ ] CategoryChips für Filterung
- [ ] StatCard für Schnellstatistiken

## Branding & Design
- [x] App-Logo generieren
- [x] Logo in assets/images speichern
- [x] app.config.ts mit App-Name und Logo aktualisieren
- [x] Theme-Farben konfigurieren
- [x] Dark Mode Support

## Testing & Polish
- [ ] Alle Buttons und Links testen
- [ ] User Flows end-to-end testen
- [ ] Fehlerbehandlung implementieren
- [ ] Loading-States implementieren
- [x] Haptic Feedback hinzufügen
- [ ] Konsole auf Fehler prüfen

## Bug Fixes (Phase 3-4)
- [x] Dashboard Sparpreis-Berechnung: Nutzt jetzt userGroup statt Math.max()
- [x] Modal-Schließen-Bug: setIsModalOpen(false) in handleConfirmPass()
- [x] Heatmap-Farb-Logik: Progressive Opacity-Abstufung (0.4, 0.7, 1.0)
- [x] Zustandstypisierung: completed: 0 statt false in settings.tsx
- [x] Haptic Feedback: FAB, Bucket-Toggle, Bucket-Delete

## Aktivitäts-Bearbeitung (Phase 2)
- [x] Edit-Modal für Logbuch-Einträge implementieren
- [x] Tippen auf Aktivität öffnet Edit-Modal
- [x] Änderungen speichern
- [x] Aktivität löschen aus Edit-Modal

## Swipe-to-Delete (Phase 2)
- [x] Swipe-Geste nach links implementieren
- [x] Delete-Button anzeigen beim Swipe
- [x] Undo-Option nach Löschung
- [x] Undo-Timeout (3 Sekunden)

## Pass-Integration (Phase 2 - Killer-Feature!)
- [x] Pass-Vorschläge beim Speichern von Aktivitäten
- [x] Wenn Ort eingegeben wird, nach passenden Saisonkarten suchen
- [x] Bestätigungsdialog: "Soll diese Aktivität zu [Pass-Name] hinzugerechnet werden?"
- [x] Automatische Inkrementierung der Besuche bei Bestätigung
- [x] Mehrere Passes pro Ort möglich

## Deployment
- [ ] Finale Tests durchführen
- [ ] Checkpoint erstellen
- [ ] App bereit für Publish
